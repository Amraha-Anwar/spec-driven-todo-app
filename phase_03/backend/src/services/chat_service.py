"""
Chat Service: Orchestrates stateless chat flow with OpenRouter LLM and MCP tools
Handles conversation management, message persistence, and agent orchestration
"""
import os
import json
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from sqlmodel import Session, select

from ..models.conversation import Conversation
from ..models.message import Message
from ..models.user import User
from .agent_runner import AgentRunner


class ChatRequest:
    """Request schema for chat endpoint"""
    def __init__(self, message: str, conversation_id: Optional[UUID] = None, language_hint: Optional[str] = None):
        self.message = message
        self.conversation_id = conversation_id
        self.language_hint = language_hint or "en"


class ChatResponse:
    """Response schema from chat endpoint"""
    def __init__(
        self,
        conversation_id: UUID,
        assistant_message: str,
        tool_calls: List[Dict[str, Any]],
        messages: List[Dict[str, Any]]
    ):
        self.conversation_id = str(conversation_id)
        self.assistant_message = assistant_message
        self.tool_calls = tool_calls
        self.messages = messages

    def dict(self):
        return {
            "conversation_id": self.conversation_id,
            "assistant_message": self.assistant_message,
            "tool_calls": self.tool_calls,
            "messages": self.messages
        }


class ChatService:
    """Orchestrates stateless chat processing with DB-sourced context"""

    def __init__(self, session: Session):
        self.session = session
        self.agent_runner = AgentRunner(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )

    async def process_chat_message(
        self,
        user_id: str,
        request: ChatRequest
    ) -> ChatResponse:
        """
        Core stateless chat processing pipeline:
        1. Fetch or create conversation
        2. Retrieve last 10 messages from database
        3. Call OpenRouter agent with MCP tool binding
        4. Persist user and assistant messages to DB
        """
        # 1. Ensure conversation exists
        conversation = await self._get_or_create_conversation(
            user_id=user_id,
            conversation_id=request.conversation_id,
            language_hint=request.language_hint
        )

        # 2. Persist user message to database
        await self._save_message(
            conversation_id=conversation.id,
            role="user",
            content=request.message
        )

        # 3. Fetch last 10 messages for context (stateless retrieval)
        context_messages = await self._fetch_message_history(
            conversation_id=conversation.id,
            limit=10
        )

        # 4. Build LLM request with system prompt and context
        system_prompt = self._build_system_prompt(request.language_hint)
        messages_for_llm = self._format_for_llm(context_messages)

        # 5. Call OpenRouter agent
        try:
            agent_response = await self.agent_runner.run_agent(
                system_prompt=system_prompt,
                messages=messages_for_llm,
                user_id=user_id,
                model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo")
            )
            
            # FIXED: Safe attribute access for agent response
            assistant_content = getattr(agent_response, 'content', None)
            if assistant_content is None and isinstance(agent_response, dict):
                assistant_content = agent_response.get('content', "I'm sorry, I couldn't process that.")
            
            tool_calls = getattr(agent_response, 'tool_calls', [])
            if not tool_calls and isinstance(agent_response, dict):
                tool_calls = agent_response.get('tool_calls', [])

        except Exception as e:
            print(f"Agent error: {str(e)}")
            assistant_content = f"I encountered an error processing your request: {str(e)}"
            tool_calls = []

        # 6. Persist assistant response with tool metadata
        await self._save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=assistant_content,
            tool_call_metadata=self._serialize_tool_calls(tool_calls) if tool_calls else None
        )

        # 7. Fetch complete message history for response
        all_messages = await self._fetch_message_history(conversation_id=conversation.id)
        messages_response = [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in all_messages
        ]

        # 8. Return response
        return ChatResponse(
            conversation_id=conversation.id,
            assistant_message=assistant_content,
            tool_calls=tool_calls or [],
            messages=messages_response
        )

    async def _get_or_create_conversation(
        self,
        user_id: str,
        conversation_id: Optional[UUID],
        language_hint: str
    ) -> Conversation:
        if conversation_id:
            statement = select(Conversation).where(
                (Conversation.id == conversation_id) &
                (Conversation.user_id == user_id)
            )
            conversation = self.session.exec(statement).first()
            if not conversation:
                raise PermissionError("Conversation not found or access denied")
            return conversation

        # FIXED: Using context_data instead of reserved 'metadata'
        conversation = Conversation(
            user_id=user_id,
            language_preference=language_hint,
            context_data={"created_via": "chat_api"}
        )
        self.session.add(conversation)
        self.session.commit()
        self.session.refresh(conversation)
        return conversation

    async def _save_message(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
        tool_call_metadata: Optional[Dict[str, Any]] = None
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tool_call_metadata=tool_call_metadata
        )
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    async def _fetch_message_history(
        self,
        conversation_id: UUID,
        limit: int = 10
    ) -> List[Message]:
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).limit(limit)

        messages = self.session.exec(statement).all()
        # Return in chronological order
        return sorted(messages, key=lambda x: x.created_at)

    def _build_system_prompt(self, language: str) -> str:
        if language == "ur":
            return """Aap ek helpful task management assistant ho.
Aap users ke tasks ko manage karne me help karte ho.
Roman Urdu aur English dono samajhte ho."""

        return """You are a helpful task management assistant.
You help users manage their tasks.
Respond in clear, concise language."""

    def _format_for_llm(self, messages: List[Message]) -> List[Dict[str, str]]:
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    def _serialize_tool_calls(self, tool_calls: List[Any]) -> Dict[str, Any]:
        # Handle both list of dicts and list of objects
        serialized = []
        for tc in tool_calls:
            if hasattr(tc, 'dict'):
                serialized.append(tc.dict())
            elif isinstance(tc, dict):
                serialized.append(tc)
            else:
                serialized.append(str(tc))
                
        return {
            "calls": serialized,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }