#!/usr/bin/env python3
"""
RomanUrduHandler MCP Server

Maps Roman Urdu user intents to standard TaskToolbox operations.
Parses natural language commands in Roman Urdu and translates to structured task operations.

Requires:
- mcp library: pip install mcp
- python-dotenv library: pip install python-dotenv
"""

import os
import json
import logging
import re
from typing import Optional, Tuple, Dict, Any
import asyncio

from dotenv import load_dotenv
import mcp.server.stdio
from mcp.types import Tool, TextContent, ToolResult

# ============================================================================
# Roman Urdu Intent Parser
# ============================================================================

class RomanUrduParser:
    """Parser for Roman Urdu task intents"""

    # Common Roman Urdu patterns for task operations
    PATTERNS = {
        # Delete patterns
        'delete': [
            r'delete\s+kar\s+do',
            r'delete\s+kar\s+de',
            r'hatao',
            r'hata\s+do',
            r'nikalo',
            r'mukkammal\s+delete',
            r'poori\s+tarrah\s+delete',
        ],
        # Create/Add patterns
        'create': [
            r'add\s+kar\s+do',
            r'add\s+kar\s+de',
            r'banao',
            r'naya\s+task',
            r'ek\s+aur\s+task',
            r'create\s+kar\s+do',
        ],
        # Complete patterns
        'complete': [
            r'complete\s+kar\s+do',
            r'complete\s+kar\s+de',
            r'mukkammal\s+kar\s+do',
            r'ho\s+gaya',
            r'tayyar\s+kar\s+do',
            r'khatam\s+kar\s+do',
            r'finish\s+kar\s+do',
        ],
        # Update patterns
        'update': [
            r'change\s+kar\s+do',
            r'badal\s+do',
            r'modify\s+kar\s+do',
            r'update\s+kar\s+do',
            r'naya\s+naam\s+de\s+do',
        ],
        # List patterns
        'list': [
            r'dikhao',
            r'show\s+kar\s+do',
            r'list\s+kar\s+do',
            r'sab\s+dekho',
            r'saare\s+task',
        ],
        # Priority patterns
        'priority_high': [
            r'urgent',
            r'zaruri',
            r'high\s+priority',
            r'pehle',
            r'phir\s+se',
        ],
        'priority_medium': [
            r'normal',
            r'medium\s+priority',
        ],
        'priority_low': [
            r'low\s+priority',
            r'baad\s+mein',
            r'chhoti\s+bat',
        ],
    }

    @staticmethod
    def parse_urdu_intent(text: str) -> Dict[str, Any]:
        """
        Parse Roman Urdu text and extract task intent.

        Args:
            text: User input in Roman Urdu

        Returns:
            Dict with operation, title, priority, etc.
        """
        text_lower = text.lower()
        result = {
            "original_text": text,
            "operation": None,
            "title": None,
            "priority": "medium",
            "confidence": 0.0,
            "raw_parsed": {}
        }

        # Detect operation
        for op, patterns in RomanUrduParser.PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    if op.startswith('priority_'):
                        result["priority"] = op.split('_')[1]
                    else:
                        result["operation"] = op
                    result["raw_parsed"][op] = True
                    break

        # Extract title (text between keywords and operation)
        # Pattern: "Mera X wala task delete kar do" -> extract X
        title_patterns = [
            r"mera\s+([a-z\s]+?)\s+(?:wala|ka)\s+task",  # "mera meeting wala task"
            r"task\s+([a-z\s]+?)\s+(?:delete|complete|add|create)",  # "task meeting delete"
            r"([a-z\s]+?)\s+(?:delete|complete|add|create)\s+kar",  # "meeting delete kar"
            r"naam\s+(.+?)(?:\s+delete|\s+complete|$)",  # "naam meeting delete"
        ]

        for pattern in title_patterns:
            match = re.search(pattern, text_lower)
            if match:
                title = match.group(1).strip()
                # Clean up title
                title = re.sub(r'\s+', ' ', title)  # Remove extra spaces
                result["title"] = title
                break

        # Set confidence based on operation detection
        if result["operation"]:
            result["confidence"] = 0.95 if result["title"] else 0.75
        else:
            result["confidence"] = 0.0

        return result

    @staticmethod
    def generate_urdu_response(operation: str, title: Optional[str] = None,
                              success: bool = True, error: Optional[str] = None) -> str:
        """
        Generate Roman Urdu response for the operation.

        Args:
            operation: The task operation performed
            title: Task title if applicable
            success: Whether operation was successful
            error: Error message if operation failed

        Returns:
            Response in Roman Urdu
        """
        if not success and error:
            return f"Maafi chahta hoon, error hua: {error}"

        responses = {
            "delete": {
                True: f"Theek hai, '{title}' task delete ho gaya." if title else "Theek hai, task delete ho gaya.",
                False: f"'{title}' task delete nahi ho saki." if title else "Task delete nahi ho saki.",
            },
            "create": {
                True: f"Bilkul, '{title}' task banaya gaya." if title else "Bilkul, naya task banaya gaya.",
                False: f"'{title}' task banane mein problem hua." if title else "Task banane mein problem hua.",
            },
            "complete": {
                True: f"Shukriya, '{title}' task mukkammal ho gaya." if title else "Shukriya, task mukkammal ho gaya.",
                False: f"'{title}' task complete nahi ho saki." if title else "Task complete nahi ho saki.",
            },
            "update": {
                True: f"Theek hai, '{title}' task update ho gaya." if title else "Theek hai, task update ho gaya.",
                False: f"'{title}' task update nahi ho saki." if title else "Task update nahi ho saki.",
            },
            "list": {
                True: "Theek hai, aapke saare tasks yahan hain.",
                False: "Tasks dikhaने mein problem hua.",
            },
        }

        return responses.get(operation, {}).get(success, "Kuch masala hua, dubara koshish karein.")


# ============================================================================
# MCP Server Setup
# ============================================================================

load_dotenv()

server = mcp.server.stdio.stdio_server()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@server.list_tools()
async def list_tools() -> list[Tool]:
    """Return available tools"""
    return [
        Tool(
            name="parse_urdu_intent",
            description="Parse Roman Urdu user input and extract task intent. Maps natural language commands to TaskToolbox operations.",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_input": {
                        "type": "string",
                        "description": "User's message in Roman Urdu (e.g., 'Mera meeting wala task delete kar do')"
                    }
                },
                "required": ["user_input"]
            }
        ),
        Tool(
            name="generate_urdu_response",
            description="Generate a Roman Urdu response for a completed task operation.",
            inputSchema={
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["delete", "create", "complete", "update", "list"],
                        "description": "The task operation performed"
                    },
                    "title": {
                        "type": "string",
                        "description": "Task title (optional)"
                    },
                    "success": {
                        "type": "boolean",
                        "description": "Whether the operation was successful (default: true)",
                        "default": True
                    },
                    "error": {
                        "type": "string",
                        "description": "Error message if operation failed (optional)"
                    }
                },
                "required": ["operation"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> ToolResult:
    """Execute a tool"""
    try:
        if name == "parse_urdu_intent":
            result = RomanUrduParser.parse_urdu_intent(arguments["user_input"])
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps(result, indent=2, ensure_ascii=False))],
                isError=False
            )

        elif name == "generate_urdu_response":
            response = RomanUrduParser.generate_urdu_response(
                operation=arguments["operation"],
                title=arguments.get("title"),
                success=arguments.get("success", True),
                error=arguments.get("error")
            )
            return ToolResult(
                content=[TextContent(type="text", text=json.dumps({
                    "urdu_response": response,
                    "operation": arguments["operation"]
                }, indent=2, ensure_ascii=False))],
                isError=False
            )

        else:
            return ToolResult(
                content=[TextContent(type="text", text=f"Unknown tool: {name}")],
                isError=True
            )

    except Exception as e:
        logger.exception(f"Error calling tool {name}")
        return ToolResult(
            content=[TextContent(type="text", text=f"Error: {str(e)}")],
            isError=True
        )


async def main():
    """Run the MCP server"""
    async with server:
        logger.info("RomanUrduHandler MCP Server started")
        await server.wait_for_exit()


if __name__ == "__main__":
    asyncio.run(main())
