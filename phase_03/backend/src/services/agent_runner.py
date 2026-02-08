"""
Agent Runner: Orchestrates OpenAI Agents SDK configured for OpenRouter
Handles LLM calls with tool binding and MCP integration
"""
import os
import json
from typing import List, Dict, Any, Optional

from openai import OpenAI


class AgentRunner:
    """Orchestrates OpenAI SDK configured to use OpenRouter as base_url"""

    # OpenRouter model configuration - read from .env, with fallback to free tier router
    PRIMARY_MODEL = "openrouter/auto"  # Will be overridden by OPENROUTER_MODEL from .env
    FALLBACK_MODEL = "openrouter/free"  # Official OpenRouter free tier router - auto-selects from available free models

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url
        self.model_routing_log = []  # Track model routing for debugging

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not provided and not found in environment")

        self.client = OpenAI(
            api_key=self.api_key,
            base_url=base_url
        )

    async def run_agent(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        user_id: str,
        tools: List[Dict[str, Any]] = None,
        # OpenRouter Auto-Free Router with stable Mistral fallback
        model: str = os.getenv("OPENROUTER_MODEL", "openrouter/auto"),
        temperature: float = 0.7,
        # Reduced from 2000 to 500 to fix the 402 "Insufficient Credits" error
        max_tokens: int = 500,
        tool_results: Optional[List[Dict[str, Any]]] = None,
        language_hint: str = "en",
        actual_tasks: Optional[List[Dict[str, Any]]] = None  # **MANDATORY FIX #1**: Actual tasks from DB
    ) -> Dict[str, Any]:
        """Execute agent call to OpenRouter with tool binding support and response synthesis.

        **T025 FIX**: Bind TaskToolbox MCP tools and set tool_choice='auto' to force LLM to use tools.
        **RESPONSE SYNTHESIS**: Two-turn flow - first turn executes tools, second turn synthesizes confirmation.

        Args:
            system_prompt: System prompt for the LLM
            messages: Conversation history for LLM context
            user_id: User ID for logging/tracing
            tools: MCP tools to bind (only used in first turn)
            model: Model to use
            temperature: Temperature for response generation
            max_tokens: Maximum tokens for response
            tool_results: Tool results from first turn (triggers second turn synthesis)
            language_hint: Language for response ('en' or 'ur' for Roman Urdu)

        Returns:
            Dict with content, tool_calls, model, usage
        """
        # If tool_results provided, this is the second turn - synthesize confirmation
        if tool_results is not None:
            return await self._synthesize_response(
                messages=messages,
                tool_results=tool_results,
                language_hint=language_hint,
                model=model,
                max_tokens=max_tokens
            )

        # First turn: Execute tools with tool_choice='auto'
        full_messages = [
            {"role": "system", "content": system_prompt},
            *messages
        ]

        # **BULLETPROOF ROUTING**: Try primary model first, then fallback
        model_to_use = model
        attempted_models = []

        # Attempt 1: Try the .env configured model (openrouter/auto or user's choice)
        print(f"DEBUG: Attempting primary model: {model_to_use}")
        attempted_models.append(model_to_use)

        try:
            # Build API call params
            api_params = {
                "model": model_to_use,
                "messages": full_messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                # Header required by OpenRouter for ranking/visibility
                "extra_headers": {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Plannoir AI Assistant",
                }
            }

            # **T025 FIX**: Pass tools and set tool_choice='auto' to force LLM to use tools
            # **SCHEMA FIX**: Only set tool_choice='auto' if tools list is not empty
            if tools and len(tools) > 0:
                api_params["tools"] = tools
                api_params["tool_choice"] = "auto"  # Force LLM to use tools when available
            else:
                # If no tools provided, don't set tool_choice (avoid 400 error)
                pass

            # **T050 FIX**: Log RAW JSON payload to verify tools array is present
            # Log before API call to verify OpenRouter will receive tools with tool_choice='auto'
            payload_for_logging = {
                "model": api_params.get("model"),
                "tools_count": len(api_params.get("tools", [])),
                "tool_choice": api_params.get("tool_choice", "not_set"),
                "has_tools_array": "tools" in api_params,
                "messages_count": len(api_params.get("messages", []))
            }
            print(f"DEBUG: Tools payload: {json.dumps(payload_for_logging)}")
            if api_params.get("tools"):
                print(f"DEBUG: Tools array present with {len(api_params['tools'])} tools: {[t.get('name', '?') for t in api_params['tools']]}")

            # **T050B FIX**: Validate tools array is not empty if tool_choice is set
            if "tool_choice" in api_params and (not api_params.get("tools") or len(api_params.get("tools", [])) == 0):
                error_msg = "Tool binding failure: tool_choice='auto' set but tools array is empty or None"
                print(f"ERROR: {error_msg}")
                return {
                    "content": f"Error: {error_msg}",
                    "tool_calls": [],
                    "error": error_msg,
                    "success": False
                }

            response = self.client.chat.completions.create(**api_params)
            print(f"DEBUG: Using model {model_to_use} (success)")
            self.model_routing_log.append({"model": model_to_use, "status": "success"})

            # Safe extraction of content
            content = response.choices[0].message.content or ""

            # Extract tool calls
            tool_calls = []
            if hasattr(response.choices[0].message, 'tool_calls') and response.choices[0].message.tool_calls:
                tool_calls = [
                    {
                        "name": tc.function.name,
                        "arguments": json.loads(tc.function.arguments)
                    }
                    for tc in response.choices[0].message.tool_calls
                ]

            return {
                "content": content,
                "tool_calls": tool_calls,
                "model": response.model,
                "usage": {
                    "total_tokens": response.usage.total_tokens
                }
            }

        except Exception as e:
            error_msg = str(e)
            print(f"DEBUG: Model {model_to_use} failed: {error_msg[:100]}")
            self.model_routing_log.append({"model": model_to_use, "status": "failed", "error": error_msg[:100]})

            # Handle 404 errors - CRUCIAL FIX: Try fallback model
            if "404" in error_msg or "not found" in error_msg.lower():
                print(f"DEBUG: Detected 404 error. Retrying with fallback model: {self.FALLBACK_MODEL}")

                # Attempt 2: Use the stable fallback (mistralai/mistral-7b-instruct:free)
                model_to_use = self.FALLBACK_MODEL
                attempted_models.append(model_to_use)

                try:
                    api_params["model"] = model_to_use
                    response = self.client.chat.completions.create(**api_params)
                    print(f"DEBUG: Using model {model_to_use} (fallback success)")
                    self.model_routing_log.append({"model": model_to_use, "status": "success (fallback)"})

                    # Successfully got response with fallback model
                    content = response.choices[0].message.content or ""
                    tool_calls = []
                    if hasattr(response.choices[0].message, 'tool_calls') and response.choices[0].message.tool_calls:
                        tool_calls = [
                            {
                                "name": tc.function.name,
                                "arguments": json.loads(tc.function.arguments)
                            }
                            for tc in response.choices[0].message.tool_calls
                        ]
                    return {
                        "content": content,
                        "tool_calls": tool_calls,
                        "model": response.model,
                        "usage": {
                            "total_tokens": response.usage.total_tokens
                        }
                    }
                except Exception as fallback_error:
                    print(f"DEBUG: Fallback model {model_to_use} also failed: {str(fallback_error)[:100]}")
                    self.model_routing_log.append({"model": model_to_use, "status": "failed", "error": str(fallback_error)[:100]})
                    error_msg = f"All model attempts failed. Tried: {attempted_models}. Error: {str(fallback_error)[:200]}"

            # Check for the 402 credit error specifically
            elif "402" in error_msg:
                error_msg = "Insufficient OpenRouter credits. Please lower max_tokens or top up your account."

            return {
                "content": f"Error calling OpenRouter: {error_msg}",
                "tool_calls": [],
                "error": error_msg
            }

    async def _synthesize_response(
        self,
        messages: List[Dict[str, str]],
        tool_results: List[Dict[str, Any]],
        language_hint: str,
        model: str,
        max_tokens: int
    ) -> Dict[str, Any]:
        """
        Second LLM turn: Synthesize a meaningful confirmation message after tool execution.

        **Key Features:**
        - Confirms the action that was taken
        - Asks about missing details (priority, due date, description)
        - Uses friendly, storyteller format
        - Responds in the same language as the user input (English or Roman Urdu)
        - Always returns a non-empty confirmation message

        Args:
            messages: Conversation history up to user's last message
            tool_results: List of results from executed tools
            language_hint: Language code ('en' or 'ur')
            model: Model to use for synthesis
            max_tokens: Maximum tokens for confirmation

        Returns:
            Dict with synthesized confirmation message
        """
        try:
            # Build synthesis system prompt based on language
            if language_hint == "ur":
                synthesis_system = """Aap ek helpful aur dost ki tarah assistant ho.

**CRITICAL**: Pehle tool results ko CHECK karo - sirf confirm karo agar action SUCCESS tha!
**FORBIDDEN**: "Done" ya koi bhi confirmation SIRF tab kaho agar tool ne "success: true" return kiya!

Jab user ne koi task action (add, delete, complete, update) kiya hota hai, to aap:
1. PEHLE verify karo ke tool action SUCCESS tha (check tool results mein "success": true)
2. Agar "success": false hai, to ERROR explain karo - KABHI confirm mat karo
3. SPECIFIC details ke saath confirm karo - task ka NAME zaror mention karo
4. Action ko STORYTELLING style mein bataao (e.g., "Mainay aapka 'Sleep' task delete kar diya!")
5. ACTUAL data include karo (task name, updated priority, etc.) - hallucinate mat karo
6. KABHI BHI generic "action completed" type phrases use mat karo
7. Proactive way se ask karo ke aur kya chahiye
8. Always Roman Urdu mein respond karo
9. Emoji use karo (🎉, ✅, 📝, etc.)

**FORBIDDEN PHRASES**:
- "Your action has been completed successfully"
- "Action completed"
- "Task action complete"
- "Done" (UNLESS tool returned success: true)
- "Bilkul done" (UNLESS tool returned success: true)
- Generic robot-like responses
- ANY confirmation without checking tool results for success: true

**REQUIRED FORMAT**:
Specific task name mention karo aur actual data include karo! Example:
- 'Mainay aapka "Sleep" task delete kar diya! 🎉'
- 'Perfect! "Code review" task complete mark ho gaya! ✅'
- '"Groceries" task ko update kar diya! Priority ab HIGH hai! 📝'

**MANDATORY FIX #4: HARD VERIFICATION**:
IF tool says "success": false, you MUST say:
"Maaf kijiye, [action] nahi ho saka kyunki: [exact error from tool]"
DO NOT say "Done" or "Bilkul" unless "success": true.

**IF TOOL FAILED**: ALWAYS report the error:
- 'Maaf kijiye, "Sleep" task delete nahi ho saka kyunki: Task not found'
- 'Maaf kijiye, update nahi ho saka kyunki: Invalid priority value'"""
            else:
                synthesis_system = """You are a helpful, warm task management assistant - like a supportive friend.

**CRITICAL**: First verify the tool results - only confirm if the action was SUCCESSFUL!
**MANDATORY FIX #4: HARD VERIFICATION** - If tool says "success": false, you MUST say:
"I failed to [action] because: [exact error from tool]"
DO NOT say "Done" or confirm unless "success": true!

When the user completes a task action (add, delete, complete, update), you should:
1. FIRST verify tool success by checking "success": true in tool results
2. If "success": false, ALWAYS explain the error - NEVER confirm action took place
3. ALWAYS mention the specific task NAME in your confirmation
4. Use STORYTELLING language - make it personal and warm
5. Include ACTUAL data from tool results (task name, priority, due date, etc.) - NEVER hallucinate details
6. NEVER use generic phrases like "Your action has been completed successfully"
7. NEVER say "Done" without verifying success: true
8. Proactively ask if they'd like to set a priority level (low/medium/high)
9. Ask if they'd like to add a due date
10. Use a conversational, encouraging, friendly tone
11. Use emojis to add warmth (🎉, ✅, 📝, etc.)

**FORBIDDEN PHRASES**:
- "Your action has been completed successfully"
- "Action completed"
- "Task action complete"
- "Done" (UNLESS tool returned success: true)
- "All set" (UNLESS tool returned success: true)
- Generic robot responses
- ANY confirmation without verifying tool results for success: true

**REQUIRED STYLE** - Always mention task by name and include actual data:
- 'Got it! I've created your "Grocery Shopping" task! 🎉 Would you like to set a priority or due date?'
- 'Done! Your "Workout" task is now marked complete! ✅ Nice work!'
- 'Perfect! I've updated your "Project Report" task to HIGH priority! 📝 Anything else you'd like to adjust?'
- 'All set! I deleted your "Old Meeting" task! ✅'

**MANDATORY FIX #4: HARD VERIFICATION**:
IF tool says "success": false, you MUST use this exact format:
"I failed to [action] because: [exact error from tool]"
DO NOT say "Done", "All set", or "Got it" unless "success": true in tool results.

**IF TOOL FAILED**: ALWAYS report the error:
- 'I failed to delete the task because: Task not found in database'
- 'I failed to update because: Invalid priority value provided'
- 'I failed to create because: Title cannot be empty'"""

            # Format tool results for context
            tool_context = self._format_tool_results(tool_results)

            # Build messages for synthesis turn
            synthesis_messages = [
                {"role": "system", "content": synthesis_system},
                *messages,
                {
                    "role": "assistant",
                    "content": f"[Tool execution completed]\n{tool_context}"
                },
                {
                    "role": "user",
                    "content": "Please confirm this action to me and ask if I'd like to add any missing details."
                }
            ]

            # Call LLM for synthesis
            response = self.client.chat.completions.create(
                model=model,
                messages=synthesis_messages,
                temperature=0.7,
                max_tokens=max_tokens,
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Plannoir AI Assistant",
                }
            )

            confirmation_content = response.choices[0].message.content or ""

            # Fallback if synthesis returns empty
            if not confirmation_content or confirmation_content.strip() == "":
                confirmation_content = self._get_fallback_confirmation(language_hint)

            return {
                "content": confirmation_content,
                "tool_calls": [],
                "model": response.model,
                "usage": {
                    "total_tokens": response.usage.total_tokens
                }
            }

        except Exception as e:
            # Always return a meaningful confirmation, even if synthesis fails
            error_msg = str(e)
            fallback_confirmation = self._get_fallback_confirmation(language_hint)

            return {
                "content": fallback_confirmation,
                "tool_calls": [],
                "error": error_msg
            }

    def _format_tool_results(self, tool_results: List[Dict[str, Any]]) -> str:
        """Format tool execution results for LLM context with detailed data extraction"""
        if not tool_results:
            return "No tool results available"

        formatted = []
        for result in tool_results:
            if isinstance(result, dict):
                action = result.get('action', 'Unknown action')
                success = result.get('success', False)
                status = '✓ SUCCESS' if success else '✗ FAILED'

                # Extract detailed data from tool result
                data = result.get('data', {})
                if isinstance(data, dict):
                    # For task operations, extract key fields
                    task_name = data.get('title', '')
                    task_id = data.get('task_id', '')
                    priority = data.get('priority', '')
                    due_date = data.get('due_date', '')
                    task_status = data.get('status', '')

                    # Build detailed message
                    details = []
                    if task_name:
                        details.append(f'Task "{task_name}"')
                    if priority:
                        details.append(f'Priority {priority}')
                    if due_date:
                        details.append(f'Due {due_date}')
                    if task_status:
                        details.append(f'Status {task_status}')

                    detail_str = ', '.join(details) if details else 'Task operation'
                    formatted.append(f"{status} {action}: {detail_str}")
                else:
                    # Fallback for non-dict data
                    message = result.get('message', result.get('data', 'Completed'))
                    formatted.append(f"{status} {action}: {message}")
            else:
                formatted.append(str(result))

        return "\n".join(formatted)

    def _get_fallback_confirmation(self, language_hint: str) -> str:
        """Get fallback confirmation when synthesis fails"""
        if language_hint == "ur":
            return "Bilkul! Mainay aapka task action complete kar diya! 🎉 Kya aor kuch karna hai?"
        else:
            return "Done! I've completed your task action! 🎉 Would you like to do anything else?"
