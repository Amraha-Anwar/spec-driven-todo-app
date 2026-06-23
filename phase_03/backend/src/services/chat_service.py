"""
Chat Service: Orchestrates stateless chat flow with OpenAI LLM and MCP tools
Handles conversation management, message persistence, and agent orchestration
"""
import os
import json
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone, timedelta
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
            api_key=os.getenv("OPENAI_API_KEY")
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
        3. Call OpenAI agent with MCP tool binding
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

        # NOTE: We deliberately do NOT short-circuit when the task list is empty.
        # The agent must always run so it can (a) answer conversationally, (b) create
        # the very first task, and (c) report an empty list naturally when asked.
        # The actual task list (which may be empty) is injected into the system prompt
        # below so the model is grounded in real database state.

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

        # 5. Call OpenAI agent with MCP tools bound
        try:
            agent_response = await self.agent_runner.run_agent(
                system_prompt=system_prompt,
                messages=messages_for_llm,
                user_id=user_id,
                tools=task_toolbox.get_tools_schema(),  # **T025**: Pass tools to force tool_choice='auto'
                model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                language_hint=request.language_hint,  # **NEW**: Pass language hint for response synthesis
                actual_tasks=actual_tasks  # **MANDATORY FIX #1**: Pass actual tasks for grounding
            )

            # **T051 FIX**: Execution guard - detect missing tool calls and retry once with forced instruction
            tool_calls = agent_response.get('tool_calls', [])
            expected_tool = self._intent_detector(request.message)  # Always detect expected tool

            # Check if tool_calls is empty OR if expected tool was NOT called (wrong tool called instead)
            tool_missing = len(tool_calls) == 0
            wrong_tool_called = False

            if expected_tool and not tool_missing:
                # Check if the expected tool was actually called
                called_tools = [tc.get('name') for tc in tool_calls]
                wrong_tool_called = expected_tool not in called_tools
                if wrong_tool_called:
                    print(f"DEBUG: Expected tool '{expected_tool}' but got {called_tools}. Will retry with hardening.")

            if tool_missing or wrong_tool_called:
                # Trigger retry if: no tools called OR wrong tool was called
                if expected_tool:
                    print(f"DEBUG: Execution guard detected missing tool '{expected_tool}' for message: {request.message[:50]}")
                    print(f"DEBUG: Retrying agent with hardened tool binding and firm instruction...")

                    # Retry with hardened tool binding (force specific tool) and firm instruction
                    action_word = self._action_from_tool(expected_tool)
                    forced_instruction = f"\n\nIMPORTANT: The user wants to {action_word}. You MUST use the '{expected_tool}' tool to complete this request. This is REQUIRED and NON-NEGOTIABLE."
                    retry_system_prompt = system_prompt + forced_instruction

                    agent_response = await self.agent_runner.run_agent(
                        system_prompt=retry_system_prompt,
                        messages=messages_for_llm,
                        user_id=user_id,
                        tools=task_toolbox.get_tools_schema(),
                        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                        language_hint=request.language_hint,
                        actual_tasks=actual_tasks,
                        force_tool_name=expected_tool  # **HARDENED BINDING**: Force specific tool during retry
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
                # Collect tool results for synthesis. We preserve the real `data`
                # (task fields, or the full list for list_tasks) and read success
                # from the tool's own result so failures are reported honestly.
                tool_results = []
                for tool in executed_tools:
                    result = tool.get('result', {}) or {}
                    if 'error' in tool:
                        # Tool raised an exception during execution
                        tool_results.append({
                            "action": tool.get('name', 'Unknown'),
                            "success": False,
                            "message": str(tool.get('error', 'Tool execution failed')),
                            "data": None
                        })
                    else:
                        tool_results.append({
                            "action": tool.get('name', 'Unknown'),
                            "success": bool(result.get('success', False)),
                            "message": result.get('error') or result.get('message', 'Completed'),
                            "data": result.get('data')
                        })

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
        Build system prompt grounded in real database state.

        - Injects the user's ACTUAL tasks so the model never hallucinates a list.
        - Computes the date dynamically (no hardcoded "Feb 8, 2026").
        - Allows natural conversation for greetings/chit-chat, while REQUIRING a
          tool call for any task operation (add/list/delete/update/complete).
        - Hides UUIDs from the model to keep responses clean.
        """
        if actual_tasks is None:
            actual_tasks = []

        # Dynamic temporal context (replaces the previous hardcoded Feb 8, 2026)
        now = datetime.now(timezone.utc)
        today_str = now.strftime("%A, %B %d, %Y")  # e.g. "Friday, June 19, 2026"
        today_iso = now.strftime("%Y-%m-%d")
        tomorrow_iso = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        next_week_iso = (now + timedelta(days=7)).strftime("%Y-%m-%d")
        current_year = now.strftime("%Y")

        # Format task list for injection (without exposing UUIDs)
        if actual_tasks:
            task_list_str = "\n**USER'S ACTUAL TASKS (FROM DATABASE)**:\n"
            for idx, task in enumerate(actual_tasks, 1):
                title = task.get('title', '?')
                status = task.get('status', '?')
                priority = task.get('priority', '?')
                # Use 1-indexed position instead of UUID
                task_list_str += f"{idx}. {title} (Status: {status}, Priority: {priority})\n"
        else:
            task_list_str = "\n**NO TASKS YET**: The user currently has no tasks in their database. If they ask to see tasks, tell them their list is empty and offer to add one. If they ask to add a task, use the add_task tool.\n"

        if language == "ur":
            return f"""Aap "Plannior" ka ek dostana, smart task management assistant ho.
Aap Roman Urdu aur English dono samajhte ho aur usi zubaan mein jawab dete ho jis mein user baat kare.

**CONVERSATION**:
- Agar user sirf baat-cheet kare (salam, "kaise ho", "tum kya kar sakte ho"), to seedha, garmjoshi se jawab do — koi tool zaroori nahi.
- Agar user koi TASK operation kare (add, list/dikhana, delete, update, complete), to aap ZAROOR sahi tool call karo. Sirf text se in cheezon ka jawab mat do.

**FETCH-BEFORE-TALK (grounding)**:
Neeche user ke ASAL tasks database se hain. Inhi ke saath kaam karo:
{task_list_str}
Jab user kisi task ka naam le (jaise "Grocery Shopping"), pehle check karo ke woh upar list mein hai. Agar nahi hai, to politely batao ke us naam ka koi task nahi mila aur available tasks dikha do. (Tool khud milte-julte naam dhoond leta hai, to title pass kar dena theek hai.)

**CLEAN EXPERIENCE**:
- KABHI task IDs (UUIDs) user ko mat dikhao — sirf titles use karo.
- Tasks dikhate waqt clean bullet list do, ID ke baghair.
- Misaal: "Aapke tasks:\n• Grocery shopping\n• Report likhna\n• Doctor se call"

**DATE/TIME (dynamic)**:
Aaj ki date: {today_str} (ISO: {today_iso}).
- "kal"/"tomorrow" = {tomorrow_iso}
- "agle hafte"/"next week" = {next_week_iso} ya uske baad
- due_date hamesha ISO format (YYYY-MM-DD) mein tool ko do.
- Current year {current_year} hai — koi purani date mat use karo."""

        return f"""You are "Plannior", a friendly and smart task management assistant.
You understand both English and Roman Urdu and reply in whichever language the user uses.

**CONVERSATION**:
- If the user is just chatting (greetings, "how are you", "what can you do"), reply directly and warmly — no tool needed.
- If the user requests a TASK operation (add, list/show, delete, update, complete), you MUST call the appropriate tool. Never answer these with text alone.

**FETCH-BEFORE-TALK (grounding)**:
Below are the user's ACTUAL tasks from their database. Work only with these:
{task_list_str}
When a user mentions a task by name (like "Grocery Shopping"), check whether it exists in the list above. If it does not, politely say you found no task with that name and show the available tasks. (The tools also resolve close/partial names, so passing the title is fine.)

**CLEAN USER EXPERIENCE**:
- NEVER show task IDs (UUIDs) to the user — refer to tasks only by their titles.
- When listing tasks, use a clean bulleted format with no IDs.
- Good: "Your tasks:\n• Buy milk\n• Finish report\n• Call dentist"
- Bad: "Your tasks:\n• ID 550e8400-...: Buy milk"

**DATE/TIME (dynamic)**:
Today is {today_str} (ISO: {today_iso}).
- "tomorrow" / "next day" = {tomorrow_iso}
- "next week" = {next_week_iso} or later
- Always pass due_date to tools in ISO format (YYYY-MM-DD).
- The current year is {current_year} — never use a past/placeholder date."""

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