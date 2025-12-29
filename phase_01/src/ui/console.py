"""
Console output formatting utilities.

Provides colored console output and table formatting for the TODO app.
"""

import colorama
from colorama import Fore, Style
from tabulate import tabulate
from src.models.task import Task

# Initialize colorama for cross-platform color support
colorama.init(autoreset=True)


def print_header(text: str) -> None:
    """Display section header with separator lines (cyan)."""
    separator = "=" * 60
    print(f"\n{Fore.CYAN}{separator}")
    print(f"{Fore.CYAN}{text:^60}")
    print(f"{Fore.CYAN}{separator}{Style.RESET_ALL}\n")


def print_success(message: str) -> None:
    """Display success message (green)."""
    print(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")


def print_error(message: str) -> None:
    """Display error message (red)."""
    print(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")


def print_prompt(text: str) -> None:
    """Display input prompt (yellow)."""
    print(f"{Fore.YELLOW}{text}{Style.RESET_ALL}", end="")


def task_to_row(task: Task) -> list[str]:
    """Convert a Task object into a formatted table row."""
    status = Fore.GREEN + "Done" if task.is_complete else Fore.YELLOW + "Not Done"
    return [Fore.CYAN + str(task.id), task.title, task.description, status]


def print_task_list(tasks: list[Task]) -> None:
    """Display all tasks in a formatted table or a message if empty."""
    if not tasks:
        print(f"{Fore.YELLOW}No tasks found.{Style.RESET_ALL}")
        return

    table_data = [task_to_row(task) for task in tasks]
    print(tabulate(
        table_data,
        headers=[Fore.MAGENTA + "ID", Fore.MAGENTA + "Title", Fore.MAGENTA + "Description", Fore.MAGENTA + "Status"],
        tablefmt="fancy_grid",
        stralign="left"
    ))


def print_command_table(commands: list[tuple[str, str]]) -> None:
    """Display a colorful table of available commands."""
    table_data = [(Fore.YELLOW + cmd, Fore.GREEN + desc) for cmd, desc in commands]
    print(tabulate(
        table_data,
        headers=[Fore.MAGENTA + "Command", Fore.MAGENTA + "Function"],
        tablefmt="fancy_grid"
    ))
