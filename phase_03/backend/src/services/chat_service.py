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
from ..tools.task_toolbox import TaskToolbox
from ..tools.roman_urdu_handler import RomanUrduHandler


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

        # **T003 FIX**: Fetch last 10 messages from Message table BEFORE calling agent (stateless context retrieval)
        context_messages = await self._fetch_message_history(
            conversation_id=conversation.id,
            limit=10
        )

        # 4. Build LLM request with system prompt and context
        system_prompt = self._build_system_prompt(request.language_hint)
        messages_for_llm = self._format_for_llm(context_messages)

        # **T025 FIX**: Initialize TaskToolbox for tool execution
        task_toolbox = TaskToolbox(self.session)
        roman_urdu_handler = RomanUrduHandler()

        # 5. Call OpenRouter agent with MCP tools bound
        try:
            agent_response = await self.agent_runner.run_agent(
                system_prompt=system_prompt,
                messages=messages_for_llm,
                user_id=user_id,
                tools=task_toolbox.get_tools_schema(),  # **T025**: Pass tools to force tool_choice='auto'
                model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo"),
                language_hint=request.language_hint  # **NEW**: Pass language hint for response synthesis
            )

            # **T025 FIX**: Execute any tool calls returned by the agent
            agent_response = await self._execute_tools(
                agent_response=agent_response,
                user_id=user_id,
                task_toolbox=task_toolbox,
                roman_urdu_handler=roman_urdu_handler
            )

            # **NEW**: If tools were executed, synthesize a meaningful confirmation message
            executed_tools = agent_response.get('executed_tools', [])
            if executed_tools:
                # Collect tool results for synthesis
                tool_results = [
                    {
                        "action": tool.get('name', 'Unknown'),
                        "success": 'error' not in tool,
                        "message": tool.get('result', {}).get('message', str(tool.get('result', tool.get('error', 'Completed'))))
                    }
                    for tool in executed_tools
                ]

                # Trigger second LLM turn to synthesize confirmation
                synthesis_response = await self.agent_runner.run_agent(
                    system_prompt=system_prompt,
                    messages=messages_for_llm,
                    user_id=user_id,
                    tool_results=tool_results,  # **NEW**: This triggers response synthesis
                    language_hint=request.language_hint
                )

                # Use synthesized response
                agent_response = synthesis_response

            # FIXED: Safe attribute access for agent response
            assistant_content = getattr(agent_response, 'content', None)
            if assistant_content is None and isinstance(agent_response, dict):
                assistant_content = agent_response.get('content', "I'm sorry, I couldn't process that.")

            # Ensure assistant_message is never empty
            if not assistant_content or assistant_content.strip() == "":
                if request.language_hint == "ur":
                    assistant_content = "Task action complete ho gaya! 🎉 Kya aur kuch karna hai?"
                else:
                    assistant_content = "Your action has been completed! 🎉 Is there anything else you'd like to do?"

            tool_calls = getattr(agent_response, 'tool_calls', [])
            if not tool_calls and isinstance(agent_response, dict):
                tool_calls = agent_response.get('tool_calls', [])

        except Exception as e:
            print(f"Agent error: {str(e)}")
            if request.language_hint == "ur":
                assistant_content = f"Maaf kijiye, ek error aya processing mein: {str(e)}"
            else:
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

    async def _execute_tools(
        self,
        agent_response: Dict[str, Any],
        user_id: str,
        task_toolbox: 'TaskToolbox',
        roman_urdu_handler: 'RomanUrduHandler'
    ) -> Dict[str, Any]:
        """
        **T026 FIX**: Execute tool calls returned by agent.
        Wraps execution in try-except with session.commit() and session.refresh() after tool execution.
        """
        tool_calls = agent_response.get('tool_calls', [])

        if not tool_calls:
            return agent_response

        executed_tools = []
        for tool_call in tool_calls:
            tool_name = tool_call.get('name')
            tool_args = tool_call.get('arguments', {})

            try:
                # **T026 FIX**: Execute tool and ensure session.commit() is called
                if tool_name == 'add_task':
                    result = task_toolbox.add_task(
                        user_id=user_id,
                        title=tool_args.get('title'),
                        description=tool_args.get('description'),
                        priority=tool_args.get('priority', 'medium'),
                        due_date=tool_args.get('due_date')
                    )
                    # session.commit() is called inside add_task()

                elif tool_name == 'list_tasks':
                    result = task_toolbox.list_tasks(
                        user_id=user_id,
                        status_filter=tool_args.get('status_filter', 'all')
                    )

                elif tool_name == 'complete_task':
                    result = task_toolbox.complete_task(
                        user_id=user_id,
                        task_id=tool_args.get('task_id')
                    )
                    # session.commit() is called inside complete_task()

                elif tool_name == 'delete_task':
                    result = task_toolbox.delete_task(
                        user_id=user_id,
                        task_id=tool_args.get('task_id')
                    )
                    # session.commit() is called inside delete_task()

                elif tool_name == 'update_task':
                    result = task_toolbox.update_task(
                        user_id=user_id,
                        task_id=tool_args.get('task_id'),
                        title=tool_args.get('title'),
                        description=tool_args.get('description'),
                        priority=tool_args.get('priority'),
                        due_date=tool_args.get('due_date'),
                        status=tool_args.get('status')
                    )
                    # session.commit() is called inside update_task()

                else:
                    result = {"error": f"Unknown tool: {tool_name}"}

                executed_tools.append({
                    "name": tool_name,
                    "arguments": tool_args,
                    "result": result
                })

            except Exception as e:
                print(f"Tool execution error ({tool_name}): {str(e)}")
                executed_tools.append({
                    "name": tool_name,
                    "arguments": tool_args,
                    "error": str(e)
                })

        # Update response with executed tools
        agent_response['executed_tools'] = executed_tools

        return agent_response

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