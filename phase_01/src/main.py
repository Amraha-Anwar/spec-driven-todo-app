"""
Console TODO Application - Main Entry Point.

A simple, in-memory task management app with colored console output and table display.
Command-driven interface.
"""

from src.services.task_manager import TaskManager, ValidationError, TaskNotFoundError
from src.ui.console import print_success, print_error, print_task_list
from src.ui.menu import get_task_input, get_task_id, show_help, get_command_choice, display_startup_message


def main() -> None:
    task_manager = TaskManager()

    # Show startup message
    display_startup_message()

    while True:
        command = get_command_choice()
        print()  # Blank line after command

        if command == "add":
            try:
                title, description = get_task_input()
                task = task_manager.create(title, description)
                print_success(f"Task created with ID {task.id}")
            except ValidationError as e:
                print_error(str(e))

        elif command == "list":
            tasks = task_manager.get_all()
            print_task_list(tasks)

        elif command == "update":
            try:
                task_id = get_task_id()
                task = task_manager.get(task_id)
                if task:
                    print(f"\nCurrent title: {task.title}")
                    print(f"Current description: {task.description}\n")
                    title, description = get_task_input()
                    task_manager.update(task_id, title, description)
                    print_success(f"Task {task_id} updated successfully")
                else:
                    print_error(f"Task ID {task_id} not found")
            except (ValidationError, TaskNotFoundError) as e:
                print_error(str(e))

        elif command == "complete":
            try:
                task_id = get_task_id()
                task = task_manager.get(task_id)
                if task:
                    status_before = "complete" if task.is_complete else "incomplete"
                    task_manager.toggle_complete(task_id)
                    status_after = "complete" if task.is_complete else "incomplete"
                    print_success(
                        f"Task {task_id} marked as {status_after} (was {status_before})"
                    )
                else:
                    print_error(f"Task ID {task_id} not found")
            except TaskNotFoundError as e:
                print_error(str(e))

        elif command == "delete":
            try:
                task_id = get_task_id()
                task_manager.delete(task_id)
                print_success(f"Task {task_id} deleted successfully")
            except TaskNotFoundError as e:
                print_error(str(e))

        elif command == "help":
            show_help()

        elif command == "exit":
            print_success("Goodbye!")
            break

        print()  # Blank line before next prompt


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n")
        print_success("Goodbye!")
        exit(0)
