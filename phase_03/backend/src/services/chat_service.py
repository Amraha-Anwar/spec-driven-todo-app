"""
Chat Service: Orchestrates stateless chat flow with OpenRouter LLM and MCP tools
Handles conversation management, message persistence, and agent orchestration
"""
import os
import json
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
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
        5. Return ChatResponse with full message history
        """
        # 1. Ensure conversation exists
        conversation = await self._get_or_create_conversation(
            user_id=user_id,
            conversation_id=request.conversation_id,
            language_hint=request.language_hint
        )

        # 2. Persist user message to database
        user_message = await self._save_message(
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
        except Exception as e:
            # Graceful fallback on LLM failure
            assistant_content = f"I encountered an error processing your request: {str(e)}"
            tool_calls = []
            agent_response = type('obj', (object,), {
                'content': assistant_content,
                'tool_calls': tool_calls
            })()

        # 6. Persist assistant response with tool metadata
        assistant_message = await self._save_message(
            conversation_id=conversation.id,
            role="assistant",
            content=agent_response.content,
            tool_call_metadata=self._serialize_tool_calls(agent_response.tool_calls) if agent_response.tool_calls else None
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
            assistant_message=agent_response.content,
            tool_calls=agent_response.tool_calls or [],
            messages=messages_response
        )

    async def _get_or_create_conversation(
        self,
        user_id: str,
        conversation_id: Optional[UUID],
        language_hint: str
    ) -> Conversation:
        """Get existing conversation or create new one"""
        if conversation_id:
            # Verify conversation ownership
            statement = select(Conversation).where(
                (Conversation.id == conversation_id) &
                (Conversation.user_id == user_id)
            )
            conversation = self.session.exec(statement).first()
            if not conversation:
                raise PermissionError("Conversation not found or access denied")
            return conversation

        # Create new conversation
        conversation = Conversation(
            user_id=user_id,
            language_preference=language_hint,
            metadata={"created_via": "chat_api"}
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
        """Persist message to database"""
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
        """Fetch last N messages in chronological order (stateless)"""
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).limit(limit)

        messages = self.session.exec(statement).all()
        return messages

    def _build_system_prompt(self, language: str) -> str:
        """Build system prompt based on language preference"""
        if language == "ur":
            return """Aap ek helpful task management assistant ho.

Aap users ke tasks ko manage karne me help karte ho. Aap:
- Tasks add, edit, delete, aur complete kar sakte ho
- Task history dekh sakte ho
- Natural language me instructions samajhte ho
- Roman Urdu aur English dono samajhte ho

Hamesha clear aur helpful responses dein."""

        return """You are a helpful task management assistant.

You help users manage their tasks. You can:
- Add, edit, delete, and complete tasks
- View task history
- Understand natural language instructions
- Respond in clear, concise language

Always be helpful and friendly."""

    def _format_for_llm(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Convert Message objects to LLM-compatible format"""
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    def _serialize_tool_calls(self, tool_calls: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Serialize tool calls for JSON storage"""
        return {
            "calls": tool_calls,
            "timestamp": datetime.utcnow().isoformat()
        }
