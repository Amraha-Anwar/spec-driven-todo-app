# Quickstart Guide: Console TODO Application

**Feature**: Console TODO Application
**Branch**: `001-console-todo-app`
**Date**: 2025-12-27

## Overview

This guide provides instructions for running, testing, and validating the Console TODO Application.

## Prerequisites

- **Python**: Version 3.13 or higher
- **UV**: Package manager (should already be installed)
- **Terminal**: Modern terminal with ANSI color support (most terminals support this)

## Installation and Setup

### 1. Ensure Environment is Ready

```bash
# Check Python version (must be 3.13+)
python --version

# Verify UV is installed
uv --version
```

### 2. Install Dependencies

```bash
# From project root directory (phase-1/)
uv sync
```

This will install:
- `colorama` for cross-platform color support
- Any other project dependencies

### 3. Verify Installation

```bash
# Run the application
uv run python src/main.py
```

You should see the TODO Application menu with colored output.

## Running the Application

### Standard Launch

```bash
uv run python src/main.py
```

### Alternative (if UV environment is activated)

```bash
# Activate UV environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Run directly
python src/main.py
```

## Using the Application

### Main Menu

When you launch the application, you'll see:

```
════════════════════════════════════════════
          TODO Application Menu
════════════════════════════════════════════

  1. Add Task
  2. View Tasks
  3. Update Task
  4. Mark Complete/Incomplete
  5. Delete Task
  6. Exit

════════════════════════════════════════════
Enter your choice (1-6):
```

### Basic Workflow

#### 1. Add Your First Task

```
Enter your choice (1-6): 1

Enter task title: Buy groceries
Enter description (optional): Milk, eggs, bread

✓ Task 1 created: Buy groceries
```

#### 2. View Your Tasks

```
Enter your choice (1-6): 2

════════════════════════════════════════════
             Task List
════════════════════════════════════════════

○ [1] Buy groceries
  └─ Milk, eggs, bread

1 task(s) total
```

**Status Indicators**:
- `○` (yellow) = Incomplete task
- `✓` (green) = Complete task

#### 3. Mark Task Complete

```
Enter your choice (1-6): 4

Enter task ID: 1

✓ Task 1 marked complete
```

#### 4. Update Task Details

```
Enter your choice (1-6): 3

Enter task ID: 1

Current title: Buy groceries
Current description: Milk, eggs, bread

Enter new title (or press Enter to keep): Buy groceries today
Enter new description (or press Enter to keep):

✓ Task 1 updated
```

#### 5. Delete Task

```
Enter your choice (1-6): 5

Enter task ID: 1

✓ Task 1 deleted
```

#### 6. Exit Application

```
Enter your choice (1-6): 6

Goodbye!
```

## Manual Testing Guide

This section provides test scenarios to validate the application meets all success criteria.

### Test 1: Task Addition Speed (SC-001)

**Objective**: Verify users can add a task in under 15 seconds

**Steps**:
1. Launch application
2. Start timer
3. Select option 1 (Add Task)
4. Enter title: "Test task"
5. Enter description: "Test description"
6. Stop timer when confirmation appears

**Pass Criteria**: Completion time < 15 seconds

**Expected Result**: `✓ Task 1 created: Test task`

---

### Test 2: Visual Task Distinction (SC-002)

**Objective**: Verify clear visual difference between complete and incomplete tasks

**Steps**:
1. Add three tasks:
   - "Task A"
   - "Task B"
   - "Task C"
2. Mark task B (ID 2) as complete
3. View task list (option 2)

**Pass Criteria**:
- Task B shows green `✓` symbol
- Tasks A and C show yellow `○` symbol
- Clear visual distinction

**Expected Output**:
```
○ [1] Task A
✓ [2] Task B
○ [3] Task C
```

---

### Test 3: All Core Operations (SC-003)

**Objective**: Complete all five operations in single session

**Steps**:
1. **Add**: Create task "Buy milk"
2. **View**: Confirm task appears in list
3. **Update**: Change title to "Buy milk and bread"
4. **Mark Complete**: Toggle status to complete
5. **Delete**: Remove the task
6. **View**: Confirm task list is empty

**Pass Criteria**: All operations complete successfully

**Expected Results**:
- Each operation shows success message
- Final view shows "No tasks found"

---

### Test 4: Invalid Input Handling (SC-004)

**Objective**: Verify 100% error handling without crashes

**Test Cases**:

#### 4a. Empty Task Title

**Steps**:
1. Select Add Task (option 1)
2. Press Enter without typing anything
3. Observe error message
4. Enter valid title

**Expected**: Error "Title is required", prompt again, no crash

#### 4b. Non-Existent Task ID

**Steps**:
1. View tasks (should be empty or have tasks 1-3)
2. Select Update Task (option 3)
3. Enter ID: 99
4. Observe error message

**Expected**: Error "Task ID 99 not found", return to menu, no crash

#### 4c. Non-Numeric Task ID

**Steps**:
1. Select Delete Task (option 5)
2. Enter ID: "abc"
3. Observe error message

**Expected**: Error "Invalid ID format", return to menu, no crash

#### 4d. Invalid Menu Choice

**Steps**:
1. At main menu, enter: 0 (or 7, or "x")
2. Observe error message
3. Menu prompts again

**Expected**: Error "Invalid choice. Please select 1-6", no crash

#### 4e. Interrupt Handling (Ctrl+C)

**Steps**:
1. Launch application
2. Press Ctrl+C (or Command+C on Mac)

**Expected**: Application exits cleanly (may show "^C" or "Goodbye")

**Pass Criteria**: All 5 test cases show appropriate error messages, application never crashes

---

### Test 5: Performance with 100+ Tasks (SC-005)

**Objective**: No performance degradation with large task list

**Setup**:
- Add 100 tasks (can repeat "Add Task" operation, or use a quick loop if available)
- Tasks can have simple titles like "Task 1", "Task 2", etc.

**Steps**:
1. View all tasks (option 2)
2. Update task ID 50
3. Delete task ID 75
4. Mark task ID 25 complete
5. View all tasks again

**Pass Criteria**: All operations complete in <1 second (no noticeable lag)

**Note**: Creating 100 tasks manually is tedious - focus on testing with 10-20 tasks to verify list performance, then extrapolate.

---

### Test 6: Consistent Formatting (SC-006)

**Objective**: Console output is visually organized

**Steps**:
1. Execute all operations (add, view, update, mark complete, delete)
2. Observe console output formatting

**Pass Criteria**:
- Headers have consistent cyan separators
- Menu options are aligned
- Task list columns are aligned
- Colors are used appropriately (not excessive)
- Clear visual hierarchy

**Visual Inspection Checklist**:
- [ ] Headers stand out from content
- [ ] Success messages are green
- [ ] Error messages are red
- [ ] Task status uses color + symbol
- [ ] Text is readable (not cluttered)

---

### Test 7: Menu Usability (SC-007)

**Objective**: First-time users can use menu without documentation

**Test**:
- Ask someone unfamiliar with the app to:
  1. Add a task
  2. View their tasks
  3. Mark a task complete

**Pass Criteria**: User completes all tasks without asking for help

**Note**: Menu options should be self-explanatory, prompts should be clear

---

## Edge Case Testing

### Test: Very Long Title

**Steps**:
1. Add task with 1000-character title
2. View task list

**Expected**: Title accepted, displayed (may be truncated in list view)

### Test: Unicode Characters

**Steps**:
1. Add task with title "Café ☕ Meeting"
2. View task list

**Expected**: Special characters display correctly

### Test: Empty Description

**Steps**:
1. Add task with title "Task"
2. Press Enter for description (leave empty)
3. View task list

**Expected**: Task created, description not shown in view

### Test: Task ID Gaps

**Steps**:
1. Create tasks 1, 2, 3
2. Delete task 2
3. Create new task

**Expected**: New task gets ID 4 (not 2)

## Quality Gate Validation

### Gate 1: Clean Environment Execution

**Objective**: Application runs in fresh environment

**Steps**:
```bash
# Remove existing virtual environment
rm -rf .venv

# Reinstall dependencies
uv sync

# Run application
uv run python src/main.py
```

**Pass Criteria**:
- Application launches without errors
- All features work correctly
- No missing dependency errors
- No import errors

---

### Gate 2: Graceful Error Handling

**Objective**: Application never crashes on invalid input

**Test Script**:
1. Launch app
2. Add task with empty title → Error, no crash
3. Update task ID 999 → Error, no crash
4. Enter menu choice "x" → Error, no crash
5. Press Ctrl+C → Clean exit

**Pass Criteria**: Application handles all invalid inputs gracefully

---

### Gate 3: Human Readability

**Objective**: Code meets readability standards

**Review Checklist**:
```
Code Quality:
[ ] All functions under 20 lines
[ ] Function names describe purpose clearly
[ ] Variable names are descriptive (no x, temp, data)
[ ] PEP 8 compliance (line length, spacing, imports)
[ ] No commented-out code
[ ] No unused imports

Documentation:
[ ] Module docstrings explain purpose
[ ] Public function docstrings document:
    - Parameters
    - Return values
    - Exceptions raised
[ ] Complex logic has explanatory comments

Structure:
[ ] Clear separation: models, services, ui
[ ] No circular dependencies
[ ] Each file has single responsibility
```

**Validation Method**: Code review by human reviewer

---

## Troubleshooting

### Issue: "Command not found: uv"

**Solution**: Install UV package manager

```bash
# Install UV (choose method for your OS)
curl -LsSf https://astral.sh/uv/install.sh | sh   # Unix/Mac
# or
pip install uv                                     # Via pip
```

### Issue: "Python version mismatch"

**Solution**: Ensure Python 3.13+ is installed

```bash
# Check version
python --version

# If <3.13, install Python 3.13 or higher
# Visit: https://www.python.org/downloads/
```

### Issue: "Colors not showing on Windows"

**Solution**: Colorama should handle this automatically. If colors still don't show:

1. Update Windows Terminal to latest version
2. Or use alternative terminal (Windows Terminal, Git Bash, WSL)

### Issue: "ModuleNotFoundError: colorama"

**Solution**: Dependencies not installed

```bash
uv sync
```

### Issue: Application crashes on launch

**Solution**: Check error message

```bash
# Run with full error trace
python src/main.py

# Common issues:
# - Missing src/ directory → check you're in project root
# - Syntax errors → check Python version is 3.13+
# - Missing files → check all src files exist
```

## Development Workflow

### Making Changes

1. **Edit code**: Modify files in `src/` directory
2. **Test changes**: Run application and validate
3. **Check code style**: Ensure PEP 8 compliance
4. **Commit changes**: Use git to track modifications

### File Locations

```
phase-1/
├── src/
│   ├── main.py              # Start here to understand flow
│   ├── models/
│   │   └── task.py          # Task data structure
│   ├── services/
│   │   └── task_manager.py  # Business logic
│   └── ui/
│       ├── console.py       # Output formatting
│       └── menu.py          # User input handling
├── specs/
│   └── 001-console-todo-app/
│       ├── spec.md          # Requirements
│       ├── plan.md          # Architecture
│       ├── data-model.md    # Data structures
│       └── quickstart.md    # This file
└── pyproject.toml           # Dependencies
```

## Success Criteria Checklist

Use this checklist to validate the application is complete:

```
✅ Success Criteria:
[ ] SC-001: Add task in <15 seconds
[ ] SC-002: Visual distinction between complete/incomplete
[ ] SC-003: All 5 operations work (add, view, update, mark, delete)
[ ] SC-004: 100% error handling (no crashes on invalid input)
[ ] SC-005: Handles 100+ tasks without lag
[ ] SC-006: Consistent, readable formatting
[ ] SC-007: Menu usable without documentation

✅ Quality Gates:
[ ] Gate 1: Runs in clean environment (uv sync → python src/main.py)
[ ] Gate 2: Graceful error handling (test all invalid inputs)
[ ] Gate 3: Human readable (PEP 8, clear names, docstrings)

✅ Edge Cases:
[ ] Very long titles (1000+ chars)
[ ] Unicode characters (café, ☕)
[ ] Empty descriptions
[ ] Task ID gaps after deletion
[ ] Interrupt handling (Ctrl+C)
```

## Additional Resources

- **Specification**: [spec.md](./spec.md) - User requirements and acceptance criteria
- **Architecture Plan**: [plan.md](./plan.md) - Technical decisions and structure
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and contracts
- **Constitution**: `../.specify/memory/constitution.md` - Project principles and standards

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review specification and plan documents
3. Verify environment setup (Python 3.13+, UV installed, dependencies synced)
4. Check that you're in the correct directory (project root)
