"""
Agent Runner: Orchestrates OpenAI Agents SDK configured for OpenRouter
Handles LLM calls with tool binding and MCP integration
"""
import os
import json
from typing import List, Dict, Any, Optional

try:
    from openai import AsyncOpenAI
except ImportError:
    # Fallback for sync usage
    from openai import OpenAI
    AsyncOpenAI = None


class AgentRunner:
    """Orchestrates OpenAI SDK configured to use OpenRouter as base_url"""

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://openrouter.ai/api/v1"):
        """
        Initialize OpenAI client pointing to OpenRouter.

        Args:
            api_key: OpenRouter API key (defaults to OPENROUTER_API_KEY env var)
            base_url: OpenRouter API endpoint
        """
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY not provided and not found in environment")

        # Initialize OpenAI client with OpenRouter config
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=base_url
        )

    async def run_agent(
        self,
        system_prompt: str,
        messages: List[Dict[str, str]],
        user_id: str,
        model: str = "openai/gpt-4-turbo",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Execute agent call to OpenRouter with optional tool binding.

        Args:
            system_prompt: System message for LLM
            messages: List of {role, content} dicts (prior context)
            user_id: User ID for tool scoping
            model: OpenRouter model identifier (e.g., "openai/gpt-4-turbo", "meta-llama/llama-3-70b-instruct")
            temperature: LLM temperature (0-2)
            max_tokens: Max tokens in response

        Returns:
            Dict with 'content' (str) and 'tool_calls' (list of dicts)
        """
        # Build message list with system prompt
        full_messages = [
            {"role": "system", "content": system_prompt},
            *messages  # Prior messages for context
        ]

        try:
            # Call OpenRouter via OpenAI SDK
            response = self.client.chat.completions.create(
                model=model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                # Note: Tool calling disabled in MVP; can be enabled in Phase II
                # tools=[...],
                # tool_choice="auto"
            )

            # Extract assistant message
            content = response.choices[0].message.content or ""

            # Extract tool calls (if any; currently disabled in MVP)
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
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }

        except Exception as e:
            # Graceful error handling
            return {
                "content": f"Error calling OpenRouter: {str(e)}",
                "tool_calls": [],
                "error": str(e)
            }
