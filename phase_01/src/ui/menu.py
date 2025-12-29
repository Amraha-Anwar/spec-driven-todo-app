"""
Menu and user input utilities.

Handles command-driven menu display, input, and task input with validation.
"""

from src.ui.console import print_header, print_prompt, print_error, print_command_table

# Command reference for help table
COMMANDS = [
    ("add", "Add a new task"),
    ("list", "List all tasks"),
    ("update", "Update a task"),
    ("complete", "Mark task complete/incomplete"),
    ("delete", "Delete a task"),
    ("help", "Show command table"),
    ("exit", "Exit the application")
]


def get_task_input() -> tuple[str, str]:
    """Prompt user for task title and description with validation."""
    while True:
        print_prompt("Title (required): ")
        title = input().strip()
        if title:
            break
        print_error("Title cannot be empty. Please try again.")

    print_prompt("Description (optional): ")
    description = input().strip()
    return title, description


def display_startup_message() -> None:
    """Show message at the start of the app about commands."""
    print_header("Welcome to TODO App")
    print("Enter 'help' to see all available commands.\n")


def get_command_choice() -> str:
    """
    Prompt user for a command (text-based).

    Returns lowercase command string.
    """
    valid_commands = {cmd for cmd, _ in COMMANDS}
    while True:
        print_prompt("Enter command: ")
        cmd = input().strip().lower()
        if cmd in valid_commands:
            return cmd
        print_error("Invalid command. Enter 'help' to see all commands.")


def get_task_id() -> int:
    """Prompt for task ID with validation."""
    while True:
        print_prompt("Enter task ID: ")
        id_input = input().strip()
        try:
            task_id = int(id_input)
            if task_id > 0:
                return task_id
            print_error("Task ID must be a positive number.")
        except ValueError:
            print_error("Invalid input. Please enter a valid task ID (number).")


def show_help() -> None:
    """Display command reference table."""
    print_header("Command Reference")
    print_command_table(COMMANDS)
    print()
