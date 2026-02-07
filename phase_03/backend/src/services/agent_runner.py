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
        # Consider changing this to "google/gemini-flash-1.5" for significantly lower costs
        model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-4-turbo"),
        temperature: float = 0.7,
        # Reduced from 2000 to 500 to fix the 402 "Insufficient Credits" error
        max_tokens: int = 500 
    ) -> Dict[str, Any]:
        """Execute agent call to OpenRouter with tool binding support."""
        full_messages = [
            {"role": "system", "content": system_prompt},
            *messages
        ]

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=full_messages,
                temperature=temperature,
                max_tokens=max_tokens,
                # Header required by OpenRouter for ranking/visibility
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Plannoir AI Assistant",
                }
            )

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