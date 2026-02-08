"""
ReferenceResolver: Natural language task reference resolution
Resolves ambiguous task references like "first", "milk task", "dusra wala" to specific task IDs.
Implements two-tier resolution: direct match (fuzzy) → contextual match (temporal/positional)
"""

import re
from typing import Dict, List, Any, Optional
from difflib import SequenceMatcher
from datetime import datetime


class ReferenceResolver:
    """
    Resolves ambiguous task references to specific task IDs.

    Two-tier approach:
    1. Tier 1: Direct match on task titles/descriptions (fuzzy string matching)
    2. Tier 2: Contextual match on temporal/positional keywords
    """

    def __init__(self):
        """Initialize resolver with keyword mappings"""
        # Temporal keywords mapping
        self.temporal_keywords = {
            "first": "oldest",
            "oldest": "oldest",
            "earliest": "oldest",
            "purana": "oldest",
            "sabse purana": "oldest",

            "last": "newest",
            "latest": "newest",
            "newest": "newest",
            "most recent": "newest",
            "naya": "newest",
            "sabse naya": "newest",
        }

        # Positional keywords mapping
        self.positional_keywords = {
            "first": 0,
            "second": 1,
            "dusra": 1,
            "third": 2,
            "tisra": 2,
            "fourth": 3,
            "fifth": 4,
        }

    def resolve_reference(
        self,
        reference: str,
        user_id: str,
        available_tasks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Resolve ambiguous task reference to a specific task.

        Two-tier approach:
        1. Tier 1: Direct match on task titles/descriptions
        2. Tier 2: Contextual match on temporal/positional keywords

        Args:
            reference: User's reference text (e.g., "first task", "milk task")
            user_id: User ID for task isolation
            available_tasks: List of Task objects to search

        Returns:
            {
                "success": true/false,
                "task_id": str (if success),
                "task_title": str (if success),
                "confidence": "high" | "medium" | "low",
                "method": "direct_match" | "temporal_match" | "positional_match" | "fuzzy_match",
                "suggestions": [...] (if multiple matches),
                "error": str (if success=false)
            }
        """
        # MANDATORY FIX #2: Log available tasks first
        print(f"DEBUG: ReferenceResolver.resolve_reference called for User {user_id}")
        print(f"DEBUG: Reference string: '{reference}'")
        print(f"DEBUG: Available tasks count: {len(available_tasks) if available_tasks else 0}")
        if available_tasks:
            for task in available_tasks[:5]:  # Log first 5 tasks
                task_id = task.get('id', task.get('task_id', 'N/A'))
                task_title = task.get('title', 'N/A')
                print(f"DEBUG:   - Task ID {task_id}: '{task_title}'")

        if not available_tasks:
            print(f"DEBUG: NO TASKS FOUND for User {user_id} - returning error")
            return {
                "success": False,
                "error": f"No tasks available for user {user_id}. Cannot resolve reference '{reference}'.",
                "suggestions": []
            }

        # Tier 1: Try direct fuzzy match
        tier1_result = self._tier1_direct_match(reference, available_tasks)
        if tier1_result:
            print(f"DEBUG: Tier 1 match found: {tier1_result.get('task_id')} ('{tier1_result.get('task_title')}')")
            return tier1_result

        # Tier 2: Try contextual match
        tier2_result = self._tier2_contextual_match(reference, available_tasks)
        if tier2_result:
            print(f"DEBUG: Tier 2 match found: {tier2_result.get('task_id')} ('{tier2_result.get('task_title')}')")
            return tier2_result

        # No match found - return suggestions
        print(f"DEBUG: No match found for '{reference}'")
        return {
            "success": False,
            "error": f"Could not find task matching '{reference}'",
            "suggestions": [
                {
                    "task_id": str(task.get("id")),
                    "task_title": task.get("title", "Unknown"),
                    "created_at": task.get("created_at")
                }
                for task in available_tasks[:5]
            ]
        }

    def _tier1_direct_match(
        self,
        reference: str,
        available_tasks: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Tier 1: Direct match on task titles and descriptions using fuzzy matching.
        Uses SequenceMatcher (Python stdlib) with configurable similarity threshold.

        **T052 FIX**: Lowered threshold to 0.6 to handle case-insensitive variations and typos.
        """
        best_match = None
        best_ratio = 0
        threshold = 0.60  # **T052**: Lowered from 0.80 to handle variations like "sleep" vs "Sleep", typos

        normalized_ref = reference.lower().strip()

        for task in available_tasks:
            # Check title match
            title = str(task.get("title", "")).lower()
            title_ratio = SequenceMatcher(None, normalized_ref, title).ratio()

            # Check description match (if available)
            desc_ratio = 0
            description = task.get("description", "")
            if description:
                desc_ratio = SequenceMatcher(None, normalized_ref, str(description).lower()).ratio()

            # Take best match
            max_ratio = max(title_ratio, desc_ratio)

            if max_ratio > best_ratio:
                best_ratio = max_ratio
                best_match = task

        # Return match if above threshold
        if best_ratio >= threshold:
            confidence = "high" if best_ratio > 0.90 else "medium"
            return {
                "success": True,
                "task_id": str(best_match.get("id")),
                "task_title": best_match.get("title", "Unknown"),
                "confidence": confidence,
                "method": "direct_match",
                "similarity": best_ratio
            }

        return None

    def _tier2_contextual_match(
        self,
        reference: str,
        available_tasks: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Tier 2: Contextual match on temporal keywords (old, new, first, last, etc.)
        and positional keywords (first, second, third, etc.)
        """
        ref_lower = reference.lower()

        # Check temporal keywords
        for keyword, temporal_type in self.temporal_keywords.items():
            if keyword in ref_lower:
                if temporal_type == "oldest":
                    # Find task with minimum created_at
                    task = min(
                        available_tasks,
                        key=lambda t: t.get("created_at", datetime.utcnow().isoformat())
                    ) if available_tasks else None
                else:  # newest
                    # Find task with maximum created_at (handle both ISO strings and datetime objects)
                    def get_comparable_date(t):
                        created_at = t.get("created_at", "")
                        if isinstance(created_at, str):
                            # ISO format strings are lexicographically sortable
                            return created_at
                        return str(created_at)

                    task = max(
                        available_tasks,
                        key=get_comparable_date
                    ) if available_tasks else None

                if task:
                    return {
                        "success": True,
                        "task_id": str(task.get("id")),
                        "task_title": task.get("title", "Unknown"),
                        "confidence": "medium",
                        "method": "temporal_match"
                    }

        # Check positional keywords
        for keyword, index in self.positional_keywords.items():
            if keyword in ref_lower:
                if 0 <= index < len(available_tasks):
                    task = available_tasks[index]
                    return {
                        "success": True,
                        "task_id": str(task.get("id")),
                        "task_title": task.get("title", "Unknown"),
                        "confidence": "medium",
                        "method": "positional_match"
                    }

        # Check numeric references (e.g., "Task 3")
        numeric_match = re.search(r'\b(\d+)\b', ref_lower)
        if numeric_match:
            index = int(numeric_match.group(1)) - 1  # Convert 1-indexed to 0-indexed
            if 0 <= index < len(available_tasks):
                task = available_tasks[index]
                return {
                    "success": True,
                    "task_id": str(task.get("id")),
                    "task_title": task.get("title", "Unknown"),
                    "confidence": "medium",
                    "method": "positional_match"
                }

        # Check status-based keywords
        if "completed" in ref_lower or "done" in ref_lower:
            for task in available_tasks:
                if task.get("status") == "completed":
                    return {
                        "success": True,
                        "task_id": str(task.get("id")),
                        "task_title": task.get("title", "Unknown"),
                        "confidence": "low",
                        "method": "status_match"
                    }

        if "pending" in ref_lower:
            for task in available_tasks:
                if task.get("status") == "pending":
                    return {
                        "success": True,
                        "task_id": str(task.get("id")),
                        "task_title": task.get("title", "Unknown"),
                        "confidence": "low",
                        "method": "status_match"
                    }

        return None
