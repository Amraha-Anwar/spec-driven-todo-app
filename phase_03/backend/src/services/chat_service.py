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
from ..tools.reference_resolver import ReferenceResolver


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
        messages: List[Dict[str, Any]],
        action_metadata: Optional[Dict[str, Any]] = None
    ):
        self.conversation_id = str(conversation_id)
        self.assistant_message = assistant_message
        self.tool_calls = tool_calls
        self.messages = messages
        self.action_metadata = action_metadata

    def dict(self):
        return {
            "conversation_id": self.conversation_id,
            "assistant_message": self.assistant_message,
            "tool_calls": self.tool_calls,
            "messages": self.messages,
            "action_metadata": self.action_metadata
        }


class ChatService:
    """Orchestrates stateless chat processing with DB-sourced context"""

    def __init__(self, session: Session):
        self.session = session
        self.agent_runner = AgentRunner(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url="https://openrouter.ai/api/v1"
        )
        self.task_toolbox = TaskToolbox(session=session)
        self.reference_resolver = ReferenceResolver()

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

        # **MANDATORY FIX #1**: Fetch-Before-Talk Rule - Get actual database tasks FIRST
        # (before building system prompt, before calling agent)
        task_toolbox = TaskToolbox(self.session)
        tasks_result = task_toolbox.list_tasks(user_id=user_id, status_filter='all')
        actual_tasks = tasks_result.get('data', []) if tasks_result.get('success') else []

        print(f"DEBUG: ChatService.process_chat_message - User {user_id} has {len(actual_tasks)} tasks")
        for task in actual_tasks:
            print(f"DEBUG:   Task ID {task.get('id')}: '{task.get('title')}'")

        # If no tasks, return early with explicit message
        if not actual_tasks:
            print(f"DEBUG: No tasks found for User {user_id} - returning empty list message")
            empty_message = "Aapki list khali hai" if request.language_hint == "ur" else "Your task list is empty"

            await self._save_message(
                conversation_id=conversation.id,
                role="assistant",
                content=empty_message
            )

            return ChatResponse(
                conversation_id=conversation.id,
                assistant_message=empty_message,
                tool_calls=[],
                messages=[{
                    "id": str(conversation.id),
                    "role": "assistant",
                    "content": empty_message,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }],
                action_metadata=None
            )

        # 4. Build LLM request with system prompt and context
        system_prompt = self._build_system_prompt(request.language_hint, actual_tasks=actual_tasks)
        messages_for_llm = self._format_for_llm(context_messages)

        roman_urdu_handler = RomanUrduHandler()

        # **FIX**: Initialize messages_response early to avoid UnboundLocalError in error handlers
        # This variable is guaranteed to exist in all code paths (including except handlers and retry failures)
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

        # 5. Call OpenRouter agent with MCP tools bound
        try:
            agent_response = await self.agent_runner.run_agent(
                system_prompt=system_prompt,
                messages=messages_for_llm,
                user_id=user_id,
                tools=task_toolbox.get_tools_schema(),  # **T025**: Pass tools to force tool_choice='auto'
                model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo"),
                language_hint=request.language_hint,  # **NEW**: Pass language hint for response synthesis
                actual_tasks=actual_tasks  # **MANDATORY FIX #1**: Pass actual tasks for grounding
            )

            # **T051 FIX**: Execution guard - detect missing tool calls and retry once with forced instruction
            tool_calls = agent_response.get('tool_calls', [])
            if not tool_calls or len(tool_calls) == 0:
                # Detect expected tool based on user intent
                expected_tool = self._intent_detector(request.message)

                if expected_tool:
                    print(f"DEBUG: Execution guard detected missing tool '{expected_tool}' for message: {request.message[:50]}")
                    print(f"DEBUG: Retrying agent with firm but clear instruction...")

                    # Retry with softened but firm instruction (removes aggression that freezes model)
                    action_word = self._action_from_tool(expected_tool)
                    forced_instruction = f"\n\nIMPORTANT: The user wants to {action_word}. Please use the '{expected_tool}' tool to complete this request. This is required."
                    retry_system_prompt = system_prompt + forced_instruction

                    agent_response = await self.agent_runner.run_agent(
                        system_prompt=retry_system_prompt,
                        messages=messages_for_llm,
                        user_id=user_id,
                        tools=task_toolbox.get_tools_schema(),
                        model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo"),
                        language_hint=request.language_hint,
                        actual_tasks=actual_tasks
                    )

                    # Check if retry succeeded
                    retry_tool_calls = agent_response.get('tool_calls', [])
                    if not retry_tool_calls or len(retry_tool_calls) == 0:
                        print(f"DEBUG: Retry failed - tool still missing. Returning error.")
                        error_message = "Technical error: Tool not triggered."
                        await self._save_message(
                            conversation_id=conversation.id,
                            role="assistant",
                            content=error_message
                        )

                        return ChatResponse(
                            conversation_id=conversation.id,
                            assistant_message=error_message,
                            tool_calls=[],
                            messages=messages_response,
                            action_metadata=None
                        )
                    else:
                        print(f"DEBUG: Retry succeeded - tool '{expected_tool}' now present")

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

        # 8. Extract action_metadata from executed_tools
        action_metadata = None
        if 'executed_tools' in agent_response:
            action_metadata = self._extract_action_metadata(agent_response.get('executed_tools', []))

        # 9. Return response
        return ChatResponse(
            conversation_id=conversation.id,
            assistant_message=assistant_content,
            tool_calls=tool_calls or [],
            messages=messages_response,
            action_metadata=action_metadata
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

    def _build_system_prompt(self, language: str, actual_tasks: List[Dict[str, Any]] = None) -> str:
        """
        Build system prompt with MANDATORY FIX #1: Inject actual database tasks.
        Agent must ground responses in real database state, not hallucinations.
        Hide UUIDs from LLM to keep responses clean.
        """
        if actual_tasks is None:
            actual_tasks = []

        # Format task list for injection (without exposing UUIDs)
        task_list_str = ""
        if actual_tasks:
            task_list_str = "\n**USER'S ACTUAL TASKS (FROM DATABASE)**:\n"
            for idx, task in enumerate(actual_tasks, 1):
                title = task.get('title', '?')
                status = task.get('status', '?')
                priority = task.get('priority', '?')
                # Use 1-indexed position instead of UUID
                task_list_str += f"{idx}. {title} (Status: {status}, Priority: {priority})\n"
            task_list_str += "\n**IMPORTANT - DO NOT EXPOSE TASK IDS TO USER**:\n"
            task_list_str += "- NEVER mention task IDs (UUIDs) in your responses\n"
            task_list_str += "- Refer to tasks ONLY by their titles\n"
            task_list_str += "- Use clean bulleted lists when showing tasks\n"
        else:
            task_list_str = "\n**NO TASKS FOUND**: The user currently has no tasks in their database.\n"

        if language == "ur":
            return f"""**T053 FIX - AGENTIC AI MANDATE**:
Aap ek Agentic AI task management assistant ho.
Aap SIRF tools ke through action perform kar sakte ho.
AGAR aap tool call nahi karte, to aap FAIL ho gaye ho.

**CRITICAL - CURRENT DATE AND TIME**:
TODAY IS SUNDAY, FEBRUARY 8, 2026.
Current Date: February 8, 2026
Aaj ki exact date: February 8, 2026 hai.
Current year IS 2026 - NEVER use 2024, 2025, or any other year.

Aap ek helpful task management assistant ho.
Aap users ke tasks ko manage karne me help karte ho.
Roman Urdu aur English dono samajhte ho.

**CRITICAL - MANDATORY FIX #1: FETCH-BEFORE-TALK**:
Neeche user ke ACTUAL tasks database se hain:
{task_list_str}

Aap SIRF un tasks ke saath kaam karo jo upar likalike hain.
Jab user koi task ka naam likh de (jaise "Grocery Shopping"), pehle check karo ke woh database mein hai ya nahi.
Agar task database mein nahi hai, to user ko "I found no tasks with that name" kehna aur available tasks batana.

**IMPORTANT - CLEAN EXPERIENCE**:
- KABHI BHI task IDs (UUIDs) user ko mat batana
- Sirf task titles se refer karo
- Tasks list karte waqt sirf naam aur details dena, ID nahi
- Example: "Aapke tasks:\n• Grocery shopping\n• Report likhna\n• Doctor se call"

**CRITICAL - TEMPORAL CONTEXT**:
TODAY IS SUNDAY, FEBRUARY 8, 2026.
Aaj ki exact date: February 8, 2026 hai.
- Jab user "tomorrow" ya "kal" kahe, to EXACTLY Feb 9, 2026 set karo.
- Jab user "next week" kahe, to Feb 15, 2026 ya uske baad set karo.
- Jab user koi specific date na dey aur default karna ho, to ALWAYS Feb 8, 2026 use karo.

**FORBIDDEN DATES**:
KABHI BHI 2024, 2025, ya kisi bhi past date use mat karo.
Sab dates 2026 mein hone chahiye."""

        return f"""**T053 FIX - AGENTIC AI MANDATE**:
You are an Agentic AI assistant.
You CANNOT perform actions without calling tools.
If you don't call a tool, you have FAILED.
Every task operation (add, delete, update, complete, list) REQUIRES a tool call.

**CRITICAL - CURRENT DATE AND TIME**:
TODAY IS SUNDAY, FEBRUARY 8, 2026.
Current Date: February 8, 2026
The current date is exactly February 8, 2026.
Current year IS 2026 - NEVER use 2024, 2025, or any other year.

You are a helpful task management assistant.
You help users manage their tasks.
Respond in clear, concise language.

**CRITICAL - MANDATORY FIX #1: FETCH-BEFORE-TALK**:
Below are the user's ACTUAL tasks from their database:
{task_list_str}

You MUST ONLY work with the tasks listed above.
When a user mentions a task name (like "Grocery Shopping"), first check if it exists in the database list.
If the task does NOT exist in the database, you MUST say "I found no tasks with that name" and list the actual tasks available.

**IMPORTANT - CLEAN USER EXPERIENCE**:
- NEVER show task IDs (UUIDs) to users in your responses
- Always refer to tasks ONLY by their titles
- When listing tasks, use a clean bulleted format without any IDs
- Example good response: "Your tasks:\n• Buy milk\n• Finish report\n• Call dentist"
- Example bad response: "Your tasks:\n• ID 550e8400-...: Buy milk"

**CRITICAL - TEMPORAL CONTEXT**:
TODAY IS SUNDAY, FEBRUARY 8, 2026.
The current date is exactly February 8, 2026.
- When user says "tomorrow" or "next day", use EXACTLY Feb 9, 2026.
- When user says "next week", use Feb 15, 2026 or later.
- When you need a default date and user provides none, ALWAYS use Feb 8, 2026.

**FORBIDDEN DATES**:
NEVER use 2024, 2025, or any past date.
All dates must be in 2026.
If user doesn't specify a year, always assume 2026."""

    def _format_for_llm(self, messages: List[Message]) -> List[Dict[str, str]]:
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    def _extract_action_metadata(self, executed_tools: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Extract action_metadata from executed tools for frontend toaster notifications.

        Returns the last successful action's metadata, or None if no successful actions.
        """
        if not executed_tools:
            return None

        # Find last successful action
        for tool in reversed(executed_tools):
            if 'error' not in tool:
                result = tool.get('result', {})
                if result.get('success'):
                    tool_name = tool.get('name', '')
                    task_data = result.get('data', {})

                    return {
                        "action": tool_name,
                        "success": True,
                        "task_id": task_data.get('id'),
                        "task_title": task_data.get('title'),
                        "message": self._generate_toaster_message(tool_name, task_data)
                    }

        return None

    def _generate_toaster_message(self, tool_name: str, task_data: Dict[str, Any]) -> str:
        """Generate user-friendly toaster message for an action."""
        task_title = task_data.get('title', 'Task')

        if tool_name == 'add_task':
            return f"Added: {task_title}"
        elif tool_name == 'delete_task':
            return f"Deleted: {task_title}"
        elif tool_name == 'update_task':
            return f"Updated: {task_title}"
        elif tool_name == 'complete_task':
            return f"Completed: {task_title}"
        return "Action completed"

    def _resolve_task_reference(self, user_id: str, task_id_param: Any) -> Dict[str, Any]:
        """
        Resolve potentially ambiguous task references to task_id (UUID string).

        Returns:
            {"success": bool, "task_id": str (UUID) or None, "error": str or None, "suggestions": [...]}
        """
        # If task_id is already a valid UUID string, return as-is
        if isinstance(task_id_param, str):
            try:
                from uuid import UUID
                UUID(task_id_param)  # Validate UUID format
                return {"success": True, "task_id": task_id_param}
            except ValueError:
                pass  # Not a UUID, continue to reference resolution

        # If task_id looks like text/reference, resolve it
        if isinstance(task_id_param, str) and task_id_param:
            # Fetch available tasks for this user
            available_tasks_result = self.task_toolbox.list_tasks(user_id=user_id, status_filter='all')

            if not available_tasks_result.get('success'):
                return {
                    "success": False,
                    "error": "Could not fetch your tasks for reference resolution"
                }

            available_tasks = available_tasks_result.get('data', [])

            # Try to resolve using ReferenceResolver
            resolution_result = self.reference_resolver.resolve_reference(
                reference=task_id_param,
                user_id=user_id,
                available_tasks=available_tasks
            )

            if resolution_result.get('success'):
                # Keep as UUID string (not int conversion)
                return {
                    "success": True,
                    "task_id": resolution_result.get('task_id')
                }
            else:
                # Return error with suggestions
                return {
                    "success": False,
                    "error": resolution_result.get('error', f"Could not find task matching '{task_id_param}'"),
                    "suggestions": resolution_result.get('suggestions', [])
                }

        return {
            "success": False,
            "error": f"Invalid task_id format: {task_id_param}"
        }

    def _intent_detector(self, user_message: str) -> Optional[str]:
        """
        Classify user intent to expected tool based on keywords in message.

        **T051 FIX**: Detect expected tool for execution guard retry logic.

        Returns:
            Tool name (e.g., 'delete_task', 'list_tasks', 'add_task') or None if no tool expected
        """
        message_lower = user_message.lower()

        # Delete intent
        if any(keyword in message_lower for keyword in ['delete', 'remove', 'erase']):
            return 'delete_task'

        # List intent
        if any(keyword in message_lower for keyword in ['list', 'show', 'what are', 'display', 'all tasks']):
            return 'list_tasks'

        # Add intent
        if any(keyword in message_lower for keyword in ['add', 'create', 'new task', 'create a task']):
            return 'add_task'

        # Complete/mark done intent
        if any(keyword in message_lower for keyword in ['mark', 'done', 'complete', 'finished']):
            return 'complete_task'

        # Update intent
        if any(keyword in message_lower for keyword in ['update', 'change', 'set', 'modify']):
            return 'update_task'

        return None

    def _action_from_tool(self, tool_name: str) -> str:
        """Convert tool name to user-friendly action description."""
        action_map = {
            'add_task': 'add a new task',
            'delete_task': 'delete a task',
            'update_task': 'update a task',
            'complete_task': 'mark a task as complete',
            'list_tasks': 'list your tasks'
        }
        return action_map.get(tool_name, 'complete this action')

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

        **T051 FIX**: Execution guard - detect missing tool_calls and retry with forced instruction.
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
                    # Resolve potentially ambiguous task reference
                    resolution = self._resolve_task_reference(
                        user_id=user_id,
                        task_id_param=tool_args.get('task_id')
                    )

                    if not resolution.get('success'):
                        result = {
                            "success": False,
                            "error": resolution.get('error', "Could not resolve task reference"),
                            "suggestions": resolution.get('suggestions', [])
                        }
                    else:
                        result = task_toolbox.complete_task(
                            user_id=user_id,
                            task_id=resolution.get('task_id')
                        )
                    # session.commit() is called inside complete_task()

                elif tool_name == 'delete_task':
                    # Resolve potentially ambiguous task reference
                    resolution = self._resolve_task_reference(
                        user_id=user_id,
                        task_id_param=tool_args.get('task_id')
                    )

                    if not resolution.get('success'):
                        result = {
                            "success": False,
                            "error": resolution.get('error', "Could not resolve task reference"),
                            "suggestions": resolution.get('suggestions', [])
                        }
                    else:
                        result = task_toolbox.delete_task(
                            user_id=user_id,
                            task_id=resolution.get('task_id')
                        )
                    # session.commit() is called inside delete_task()

                elif tool_name == 'update_task':
                    # Resolve potentially ambiguous task reference
                    resolution = self._resolve_task_reference(
                        user_id=user_id,
                        task_id_param=tool_args.get('task_id')
                    )

                    if not resolution.get('success'):
                        result = {
                            "success": False,
                            "error": resolution.get('error', "Could not resolve task reference"),
                            "suggestions": resolution.get('suggestions', [])
                        }
                    else:
                        result = task_toolbox.update_task(
                            user_id=user_id,
                            task_id=resolution.get('task_id'),
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