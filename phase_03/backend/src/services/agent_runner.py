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

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url

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
        # Consider changing this to "google/gemini-flash-1.5" for significantly lower costs
        model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo"),
        temperature: float = 0.7,
        # Reduced from 2000 to 500 to fix the 402 "Insufficient Credits" error
        max_tokens: int = 500,
        tool_results: Optional[List[Dict[str, Any]]] = None,
        language_hint: str = "en"
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

        try:
            # Build API call params
            api_params = {
                "model": model,
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

            response = self.client.chat.completions.create(**api_params)

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
            # Check for the 402 credit error specifically
            error_msg = str(e)
            if "402" in error_msg:
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

Jab user ne koi task action (add, delete, complete, update) kiya hota hai, to aap:
1. Warmly confirm karo ke action successfully complete hua
2. Proactive way se ask karo ke kya unhe priority set karna chahiye (low/medium/high)?
3. Puchho ke due date add karna chahte ho?
4. Friendly aur supportive tone use karo - jaise aap unka assistant friend ho
5. Always Roman Urdu mein respond karo
6. Emoji use karo engagement ke liye (🎉, ✅, 📝, etc.)

Example confirmations:
- 'Task successfully create ho gaya! 🎉 Kya aap iska priority set karna chahenge? (low/medium/high)'
- 'Perfect! Task delete ho gaya! ✅ Agla task ke liye mujhe aage help deni hai?'
- 'Bilkul! Task complete mark ho gaya! 🎉 Kya koi aur task banani hai?'"""
            else:
                synthesis_system = """You are a helpful, warm task management assistant - like a supportive friend.

When the user completes a task action (add, delete, complete, update), you should:
1. Warmly confirm that the action was successful
2. Proactively ask if they'd like to set a priority level (low/medium/high)
3. Ask if they'd like to add a due date
4. Use a conversational, encouraging, friendly tone
5. Use emojis to add warmth and engagement (🎉, ✅, 📝, etc.)
6. Be brief and focused - confirm action first, then ask about missing details
7. Always suggest next steps to make their task more complete

Example confirmations:
- 'Got it! Your task has been created! 🎉 Would you like to set a priority level (low/medium/high) or add a due date?'
- 'Done! Task marked as complete! ✅ Nice work! Want to create another task?'
- 'Perfect! I've updated your task! ✅ Is there anything else you'd like to adjust?'"""

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
        """Format tool execution results for LLM context"""
        if not tool_results:
            return "No tool results available"

        formatted = []
        for result in tool_results:
            if isinstance(result, dict):
                action = result.get('action', 'Unknown action')
                success = result.get('success', False)
                message = result.get('message', result.get('data', 'Completed'))
                status = '✓' if success else '✗'
                formatted.append(f"{status} {action}: {message}")
            else:
                formatted.append(str(result))

        return "\n".join(formatted)

    def _get_fallback_confirmation(self, language_hint: str) -> str:
        """Get fallback confirmation when synthesis fails"""
        if language_hint == "ur":
            return "Task action successfully complete ho gaya! 🎉 Agar kuch aur chahiye to batao!"
        else:
            return "Your action has been completed successfully! 🎉 Let me know if you'd like to adjust anything."
