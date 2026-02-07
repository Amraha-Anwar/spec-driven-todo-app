"""
RomanUrduHandler: Natural Roman Urdu intent parsing for task operations
Task ID: T014 - Implements 2-tier resolution (pattern matching + LLM fallback)
Handles ambiguous references with contextual disambiguation
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from openai import OpenAI
import os


class RomanUrduHandler:
    """
    Parses Roman Urdu (Urdu in Latin characters) task commands.
    Two-tier approach:
    1. Fast pattern matching for common phrases
    2. LLM fallback for ambiguous/complex input
    """

    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url

        if self.api_key:
            self.client = OpenAI(api_key=self.api_key, base_url=base_url)
        else:
            self.client = None

        # Pattern definitions for common Roman Urdu phrases
        self.patterns = {
            # Add task patterns
            r"mera\s+task\s+add\s+kar(?:do|a)\s*[:=]?\s*(.+)": "add_task",
            r"mera\s+task\s+banao\s*[:=]?\s*(.+)": "add_task",
            r"task\s+add\s+kar(?:do|a)\s*[:=]?\s*(.+)": "add_task",

            # Delete task patterns
            r"mera\s+task\s+delete\s+kar(?:do|a)\s*[:=]?\s*(.+)": "delete_task",
            r"mera\s+task\s+hatao\s*[:=]?\s*(.+)": "delete_task",
            r"task\s+delete\s+kar(?:do|a)\s*[:=]?\s*(.+)": "delete_task",

            # Complete task patterns
            r"mera\s+task\s+complete\s+kar(?:do|a)\s*[:=]?\s*(.+)": "complete_task",
            r"mera\s+task\s+mukammal\s+kar(?:do|a)\s*[:=]?\s*(.+)": "complete_task",
            r"(?:mark|complete)\s+(.+?)\s+(?:as\s+)?(?:done|complete)": "complete_task",

            # List tasks patterns
            r"mera\s+(?:sab|tamaam)\s+tasks?\s+(?:dikhao|show)": "list_tasks",
            r"mera\s+tasks?\s+dikhao": "list_tasks",
            r"tasks?\s+list\s+kar(?:do|a)": "list_tasks",

            # Update task patterns
            r"mera\s+task\s+update\s+kar(?:do|a)\s*[:=]?\s*(.+)": "update_task",
            r"task\s+(?:update|change)\s+kar(?:do|a)\s*[:=]?\s*(.+)": "update_task",
        }

    def parse_urdu_intent(self, user_input: str) -> Dict[str, Any]:
        """
        Parse Roman Urdu command to structured intent.

        Two-tier resolution:
        1. Try pattern matching (fast, no LLM cost)
        2. Fall back to LLM parsing if ambiguous

        Returns:
            Dict with operation (add_task, delete_task, etc.) and params
        """
        # Normalize input: lowercase, trim whitespace
        normalized = user_input.lower().strip()

        # Tier 1: Pattern matching
        result = self._try_pattern_matching(normalized)
        if result:
            return result

        # Tier 2: LLM fallback for ambiguous input
        if self.client:
            return self._llm_parse_urdu_intent(user_input)

        # Fallback if no client available
        return {
            "success": False,
            "error": "Could not parse Urdu command",
            "raw_input": user_input
        }

    def _try_pattern_matching(self, normalized_input: str) -> Optional[Dict[str, Any]]:
        """
        Try to match input against known patterns.
        Returns parsed intent or None if no match.
        """
        for pattern, operation in self.patterns.items():
            match = re.search(pattern, normalized_input, re.IGNORECASE)
            if match:
                # Extract parameters from captured groups
                params = {}
                if match.groups():
                    task_ref = match.group(1).strip()
                    if operation in ["add_task", "update_task"]:
                        params["title"] = task_ref
                    elif operation in ["delete_task", "complete_task"]:
                        # Could be task title or task reference
                        params["task_reference"] = task_ref
                    elif operation == "update_task":
                        params["title"] = task_ref

                return {
                    "success": True,
                    "operation": operation,
                    "params": params,
                    "source": "pattern_match"
                }

        return None

    def _llm_parse_urdu_intent(self, user_input: str) -> Dict[str, Any]:
        """
        Use LLM to parse ambiguous or complex Roman Urdu input.
        Returns structured intent matching Urdu semantics.
        """
        try:
            prompt = f"""Parse this Roman Urdu task command and return JSON with operation and parameters.

Roman Urdu input: "{user_input}"

Valid operations: add_task, delete_task, complete_task, list_tasks, update_task

Return ONLY valid JSON, no extra text:
{{"operation": "...", "params": {{...}}}}

Examples:
- "Mera task add kardo: buy milk" → {{"operation": "add_task", "params": {{"title": "buy milk"}}}}
- "Mera task delete kardo: old task" → {{"operation": "delete_task", "params": {{"task_reference": "old task"}}}}
- "Mera tasks dikhao" → {{"operation": "list_tasks", "params": {{}}}}"""

            response = self.client.chat.completions.create(
                model="openai/gpt-4o-mini",  # Cheaper model for parsing
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
                max_tokens=200
            )

            response_text = response.choices[0].message.content.strip()

            # Parse JSON response
            try:
                parsed = json.loads(response_text)
                parsed["success"] = True
                parsed["source"] = "llm_parse"
                return parsed
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "error": "LLM returned invalid JSON",
                    "raw_response": response_text
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"LLM parsing error: {str(e)}"
            }

    def resolve_ambiguous_reference(
        self,
        reference: str,
        recent_messages: List[Dict[str, str]],
        available_tasks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Resolve ambiguous task references like "Purana wala" (the old one).

        Two-tier approach:
        1. Direct match on task titles from recent conversation
        2. Contextual match on temporal keywords (old, first, last, etc.)

        Args:
            reference: User's task reference (e.g., "purana wala", "first one")
            recent_messages: Last 10 messages from conversation
            available_tasks: List of user's available tasks

        Returns:
            Dict with resolution result: {success, task_id, task_title, confidence}
        """
        normalized_ref = reference.lower().strip()

        # Tier 1: Direct match on task titles mentioned in recent messages
        for msg in recent_messages:
            if msg.get("role") == "assistant":
                content = msg.get("content", "").lower()
                for task in available_tasks:
                    task_title = task.get("title", "").lower()
                    if task_title in content:
                        return {
                            "success": True,
                            "task_id": task.get("task_id"),
                            "task_title": task.get("title"),
                            "confidence": "high",
                            "method": "direct_match"
                        }

        # Tier 2: Contextual match on temporal/positional keywords
        temporal_keywords = {
            "purana": "oldest",  # Old one
            "pehla": "first",  # First one
            "akhri": "last",  # Last one
            "latest": "latest",
            "sabse purana": "oldest"
        }

        for keyword, temporal_type in temporal_keywords.items():
            if keyword in normalized_ref:
                if temporal_type == "oldest" and available_tasks:
                    task = min(available_tasks, key=lambda t: t.get("created_at", ""))
                    return {
                        "success": True,
                        "task_id": task.get("task_id"),
                        "task_title": task.get("title"),
                        "confidence": "medium",
                        "method": "temporal_match"
                    }
                elif temporal_type == "first" and available_tasks:
                    task = available_tasks[0]
                    return {
                        "success": True,
                        "task_id": task.get("task_id"),
                        "task_title": task.get("title"),
                        "confidence": "medium",
                        "method": "positional_match"
                    }
                elif temporal_type == "last" and available_tasks:
                    task = available_tasks[-1]
                    return {
                        "success": True,
                        "task_id": task.get("task_id"),
                        "task_title": task.get("title"),
                        "confidence": "medium",
                        "method": "positional_match"
                    }

        # No clear match found - return ambiguous
        return {
            "success": False,
            "error": f"Ambiguous reference: '{reference}'",
            "suggestions": [
                {"task_id": t.get("task_id"), "task_title": t.get("title")}
                for t in available_tasks[:5]  # Suggest first 5 tasks
            ]
        }

    # ========================================================================
    # Tool Schema Definition (for MCP registration)
    # ========================================================================

    @staticmethod
    def get_tools_schema() -> Dict[str, Any]:
        """Returns MCP tool definition for RomanUrduHandler"""
        return {
            "name": "parse_urdu_intent",
            "description": "Parse Roman Urdu (Urdu in Latin characters) task commands to structured operations",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "user_input": {"type": "string", "description": "Roman Urdu command (e.g., 'Mera task add kardo: buy milk')"}
                },
                "required": ["user_input"]
            }
        }
