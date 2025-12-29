# Implementation Plan: Console TODO Application

**Branch**: `001-console-todo-app` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-console-todo-app/spec.md`

## Summary

Build an in-memory, console-based TODO application that demonstrates clean architecture and spec-driven development. The application will provide a menu-driven interface for managing tasks (add, view, update, delete, mark complete/incomplete) with colored console output for enhanced user experience. All tasks are stored in memory only and lost on exit.

**Technical Approach**: Three-layer architecture with strict separation between data models, business logic, and console UI. Use colorama for cross-platform color support. Implement simple in-memory storage with sequential ID generation. Focus on robustness through comprehensive input validation and graceful error handling.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: colorama (lightweight, zero dependencies, cross-platform ANSI color support)
**Storage**: In-memory only (dict-based task store)
**Testing**: Manual validation against specification success criteria (no test framework)
**Target Platform**: Cross-platform CLI (Windows, Linux, macOS)
**Project Type**: Single project (console application)
**Performance Goals**: Handle 100+ tasks without noticeable lag (<100ms for any operation)
**Constraints**:
- No external dependencies beyond colorama
- No persistence layer
- Console-only interface
- Single-session operation
**Scale/Scope**: Single-user, single-session, up to 100+ tasks

## Constitution Check

### Compliance Status: ✅ PASS

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **I. Spec-First Development** | No code without approved spec | ✅ PASS | Specification complete and approved |
| **II. Agent-Driven Execution** | Claude Code as sole code author | ✅ PASS | All implementation will be agent-driven |
| **III. Clarity Over Complexity** | Simple, readable solutions | ✅ PASS | Architecture uses straightforward patterns, no over-engineering |
| **IV. Deterministic Behavior** | Predictable outputs for identical inputs | ✅ PASS | Sequential ID generation, no randomness, controlled state |
| **V. Extensibility by Design** | Support future phases without refactoring | ✅ PASS | Clear module boundaries enable future UI/persistence additions |

### Separation of Concerns

| Concern | Location | Responsibility |
|---------|----------|----------------|
| **Data Models** | `src/models/task.py` | Task entity definition only |
| **Business Logic** | `src/services/task_manager.py` | Task CRUD operations, validation, ID generation |
| **I/O Handling** | `src/ui/console.py`, `src/ui/menu.py` | Console formatting, user input, menu display |

### Quality Gates

| Gate | Requirement | Validation Method |
|------|-------------|-------------------|
| **Gate 1: Clean Environment** | Runs in fresh Python 3.13+ with UV | Test: `uv sync && python src/main.py` |
| **Gate 2: Graceful Error Handling** | No crashes on invalid input | Test: Provide empty titles, invalid IDs, non-numeric input |
| **Gate 3: Human Readability** | PEP 8 compliance, clear naming | Code review against constitution standards |

## Project Structure

### Documentation (this feature)

```text
specs/001-console-todo-app/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file - implementation plan
├── data-model.md        # Task entity and contract definitions
├── quickstart.md        # Usage guide for running the application
└── checklists/
    └── requirements.md  # Specification quality validation (complete)
```

### Source Code (repository root)

```text
src/
├── main.py              # Application entry point, main loop
├── models/
│   └── task.py          # Task data class definition
├── services/
│   └── task_manager.py  # Business logic: CRUD operations, validation
└── ui/
    ├── console.py       # Console output formatting, color utilities
    └── menu.py          # Menu display and user input handling

pyproject.toml           # Project dependencies (colorama)
README.md                # Project overview
```

**Structure Decision**: Single project structure selected. This is a standalone console application with no web/mobile components. The three-layer separation (models, services, ui) provides clear boundaries and supports future extension to web/GUI interfaces without touching business logic.

## Architectural Decisions

### Decision 1: Console Formatting Library - Colorama

**Options Considered**:

1. **Colorama** (chosen)
   - Pros: Lightweight (<100KB), zero dependencies, cross-platform, simple API, Python 3.13 tested
   - Cons: Limited to basic ANSI support, no advanced features like tables/progress bars
   - Use case: Basic color formatting for menus, status, messages

2. **Rich**
   - Pros: Advanced features (tables, progress bars, markdown rendering), beautiful output
   - Cons: Larger library (~500KB+), more dependencies, overkill for simple TODO app
   - Use case: Complex dashboards, rich CLI interfaces

3. **Standard Library only (ANSI codes)**
   - Pros: Zero dependencies
   - Cons: No Windows compatibility without extra work, manual escape sequence management
   - Use case: Unix-only applications

**Decision**: Use **colorama**

**Rationale**:
- Aligns with constitution principle III (Clarity Over Complexity): simplest solution that meets requirements
- Meets FR-007, FR-012, FR-013 (colored output for status, success, errors)
- Cross-platform support required per spec assumptions (Windows, Linux, macOS terminals)
- Zero dependencies beyond standard library maintains lightweight constraint
- Python 3.13 compatibility confirmed
- Rich would violate the "no over-engineering" constraint - we only need basic colors, not tables/progress bars

**Trade-offs Accepted**:
- No advanced formatting features (tables, progress bars) - not needed per spec
- "Dim text" limitation on Windows - not required by spec
- Future phases requiring rich formatting would need library upgrade - acceptable for Phase I focus

**References**:
- [Colorama GitHub](https://github.com/tartley/colorama)
- [Colorama PyPI](https://pypi.org/project/colorama/)

### Decision 2: Task ID Generation - Sequential Counter

**Options Considered**:

1. **Sequential Counter** (chosen)
   - Pros: Simple, predictable, human-readable, deterministic
   - Cons: IDs not reclaimed after deletion (acceptable per spec assumptions)
   - Implementation: Integer counter starting at 1

2. **UUID**
   - Pros: Universally unique, no collision risk
   - Cons: Not human-friendly (e.g., "3a8f7b2d-..."), violates clarity principle
   - Use case: Distributed systems

3. **Timestamp-based**
   - Pros: Chronologically sortable
   - Cons: Not deterministic (violates constitution principle IV), collision risk
   - Use case: Distributed logging

**Decision**: Use **Sequential Counter**

**Rationale**:
- Meets FR-001 (unique sequential IDs starting from 1)
- Constitution principle IV (Deterministic Behavior): same operations produce same IDs
- Human-readable IDs improve usability for console interface
- Specification explicitly states "gaps in ID sequences are acceptable" after deletion
- Simple implementation: single integer variable, no complex logic

**Implementation Details**:
- TaskManager maintains `next_id` counter
- Increment after each task creation
- Never decrement (IDs never reused even after deletion)
- Deterministic: IDs assigned in creation order

### Decision 3: In-Memory Storage - Dictionary

**Options Considered**:

1. **Dictionary (dict[int, Task])** (chosen)
   - Pros: O(1) lookup by ID, simple, native Python, no imports needed
   - Cons: No ordering guarantees (acceptable - can sort on retrieval)
   - Use case: Fast ID-based access

2. **List**
   - Pros: Ordered, simple iteration
   - Cons: O(n) lookup by ID, must search entire list
   - Use case: Small datasets where order matters more than access speed

3. **OrderedDict**
   - Pros: Maintains insertion order, O(1) lookup
   - Cons: Unnecessary - regular dict maintains insertion order in Python 3.7+
   - Use case: Legacy Python versions

**Decision**: Use **Dictionary (dict[int, Task])**

**Rationale**:
- Meets FR-016 (store tasks in memory during runtime)
- O(1) access by task ID for update/delete/mark operations
- Simple, no external dependencies
- Python 3.13 dicts maintain insertion order (PEP 468)
- Performance target: 100+ tasks without degradation - dict scales well

**Trade-offs**:
- No built-in ordering - will sort tasks by ID when displaying (acceptable overhead)
- Lost on application exit - per spec design

### Decision 4: Error Handling Strategy - Input Validation Layer

**Approach**: Comprehensive validation at service layer with typed exceptions, graceful error messages at UI layer.

**Key Validations**:

| Input Type | Validation | Error Message |
|------------|-----------|---------------|
| Task Title | Non-empty string | "Title is required" |
| Task ID | Integer, exists in store | "Task ID {id} not found" |
| Menu Choice | Integer, valid range | "Invalid choice. Please select 1-6" |
| Description | Any string (including empty) | N/A - no validation needed |

**Exception Types**:
- `ValidationError`: Invalid input (empty title)
- `TaskNotFoundError`: Task ID doesn't exist
- `InvalidInputError`: Non-numeric input where number expected

**Rationale**:
- Meets FR-014, FR-015 (validate inputs, clear error messages)
- Constitution principle IV (Deterministic): same invalid input → same error
- Aligns with SC-004 (100% error handling without crashes)

### Decision 5: Module Boundaries and Responsibilities

**Architecture Pattern**: Three-layer separation (Models, Services, UI)

#### Layer 1: Models (`src/models/task.py`)

**Responsibility**: Data structure definition only
- Task dataclass with fields: id, title, description, is_complete
- No business logic, no I/O, no validation
- Immutable ID, mutable title/description/status

**Why**: Enables future serialization (JSON, database) without touching business logic

#### Layer 2: Services (`src/services/task_manager.py`)

**Responsibility**: Business logic and state management
- Task CRUD operations (create, get, get_all, update, delete, toggle_complete)
- Input validation (title required, ID exists)
- ID generation (sequential counter)
- In-memory storage (dict)
- No console I/O, no user interaction

**Why**: Business logic can be reused with different UI layers (web, GUI) in future phases

#### Layer 3: UI (`src/ui/console.py`, `src/ui/menu.py`)

**Responsibility**: User interaction and display formatting
- `console.py`: Output formatting, color utilities, message display
- `menu.py`: Menu display, user input capture, input parsing
- Calls TaskManager methods, displays results
- No business logic

**Why**: UI layer can be swapped (web, GUI) without changing business logic

**Communication Flow**:
```
User Input → menu.py (parse) → task_manager.py (validate & execute) → console.py (format & display)
```

**Dependency Rules**:
- UI layer depends on Services layer (one-way)
- Services layer depends on Models layer (one-way)
- Models layer has zero dependencies (pure data)
- No circular dependencies
- No layer skipping (UI cannot directly access Models)

## Console Interaction Flow

### Application Lifecycle

```
START
  ↓
Initialize TaskManager (empty)
  ↓
Display Welcome Message
  ↓
┌─────────────────────────┐
│   Main Menu Loop        │
│  1. Add Task            │
│  2. View Tasks          │
│  3. Update Task         │
│  4. Mark Complete       │
│  5. Delete Task         │
│  6. Exit                │
└─────────────────────────┘
  ↓
User selects option (1-6)
  ↓
Execute operation
  ↓
Display result (success/error)
  ↓
Return to Main Menu
  (loop until user selects Exit)
  ↓
Display Goodbye Message
  ↓
END
```

### Operation Flows

#### 1. Add Task Flow

```
Display "Add Task" header
  ↓
Prompt: "Enter task title:"
  ↓
User inputs title
  ↓
Validate: title not empty?
  NO → Display error "Title is required" → Prompt again
  YES ↓
Prompt: "Enter description (optional):"
  ↓
User inputs description (or empty)
  ↓
Create task (TaskManager.create)
  ↓
Display success: "✓ Task {id} created: {title}"
  ↓
Return to main menu
```

#### 2. View Tasks Flow

```
Display "Task List" header
  ↓
Get all tasks (TaskManager.get_all)
  ↓
Task list empty?
  YES → Display "No tasks found"
  NO ↓
Sort tasks by ID
  ↓
For each task:
  Display: [ID] Status Title
    • Status: "✓" (green) if complete, "○" (yellow) if incomplete
    • Title: truncate if >50 chars
  If description exists:
    Display: "  └─ {description}" (gray)
  ↓
Display count: "{count} task(s) total"
  ↓
Return to main menu
```

#### 3. Update Task Flow

```
Display "Update Task" header
  ↓
Prompt: "Enter task ID:"
  ↓
User inputs ID
  ↓
Parse ID as integer
  FAIL → Display error "Invalid ID format" → Return to menu
  SUCCESS ↓
Get task (TaskManager.get)
  NOT FOUND → Display error "Task ID {id} not found" → Return to menu
  FOUND ↓
Display current values:
  "Current title: {title}"
  "Current description: {description}"
  ↓
Prompt: "Enter new title (or press Enter to keep):"
  ↓
User inputs new title or empty
  ↓
Prompt: "Enter new description (or press Enter to keep):"
  ↓
User inputs new description or empty
  ↓
Validate: if new title provided, must not be empty
  FAIL → Display error "Title cannot be empty" → Return to menu
  SUCCESS ↓
Update task (TaskManager.update)
  ↓
Display success: "✓ Task {id} updated"
  ↓
Return to main menu
```

#### 4. Mark Complete/Incomplete Flow

```
Display "Mark Task Complete" header
  ↓
Prompt: "Enter task ID:"
  ↓
User inputs ID
  ↓
Parse ID as integer
  FAIL → Display error "Invalid ID format" → Return to menu
  SUCCESS ↓
Toggle status (TaskManager.toggle_complete)
  NOT FOUND → Display error "Task ID {id} not found" → Return to menu
  FOUND ↓
Get new status (complete or incomplete)
  ↓
Display success: "✓ Task {id} marked {status}"
  ↓
Return to main menu
```

#### 5. Delete Task Flow

```
Display "Delete Task" header
  ↓
Prompt: "Enter task ID:"
  ↓
User inputs ID
  ↓
Parse ID as integer
  FAIL → Display error "Invalid ID format" → Return to menu
  SUCCESS ↓
Delete task (TaskManager.delete)
  NOT FOUND → Display error "Task ID {id} not found" → Return to menu
  FOUND ↓
Display success: "✓ Task {id} deleted"
  ↓
Return to main menu
```

### Menu Display Format

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
Enter your choice (1-6): _
```

### Color Usage Strategy

| Element | Color | Purpose |
|---------|-------|---------|
| Menu headers | Cyan (bright) | Visual hierarchy, section separation |
| Menu options | White (default) | Readable, neutral |
| Prompts | Yellow | Indicates input required |
| Success messages | Green | Positive feedback |
| Error messages | Red (bright) | Alert, attention needed |
| Task status (complete) | Green | "✓" symbol |
| Task status (incomplete) | Yellow | "○" symbol |
| Task descriptions | Gray (dim) | Secondary information |
| Separators | Cyan | Visual structure |

**Accessibility Considerations**:
- Color is supplementary to symbols (✓, ○)
- High contrast combinations (bright colors on dark terminal, or vice versa)
- Consistent color meanings throughout application
- Text remains readable if colors are not displayed

## Data Model Definitions

### Task Entity

**File**: `src/models/task.py`

**Structure**:

```python
@dataclass
class Task:
    """
    Represents a single TODO task.

    Attributes:
        id: Unique sequential identifier (immutable, assigned by TaskManager)
        title: Task title (required, mutable)
        description: Optional task details (mutable)
        is_complete: Completion status (mutable)

    Invariants:
        - id is always positive integer
        - title is never empty string
        - description can be empty string
        - is_complete is boolean only
    """
    id: int
    title: str
    description: str
    is_complete: bool
```

**Validation Rules**:
- `id`: Must be positive integer (enforced by TaskManager during creation)
- `title`: Must be non-empty string (enforced by TaskManager before create/update)
- `description`: Any string, including empty (no validation)
- `is_complete`: Boolean only (enforced by type system)

**Mutability**:
- `id`: Immutable after creation (never changed)
- `title`: Mutable (via update operation)
- `description`: Mutable (via update operation)
- `is_complete`: Mutable (via toggle operation)

### TaskManager Contract

**File**: `src/services/task_manager.py`

**Public Interface**:

```python
class TaskManager:
    """
    Manages task lifecycle and business logic.

    Responsibilities:
        - Task CRUD operations
        - ID generation (sequential)
        - Input validation
        - In-memory storage

    State:
        - tasks: dict[int, Task] - ID to Task mapping
        - next_id: int - Next available ID (starts at 1)
    """

    def create(title: str, description: str = "") -> Task:
        """
        Create new task with auto-generated ID.

        Args:
            title: Task title (required)
            description: Task description (optional, defaults to empty)

        Returns:
            Created Task object with assigned ID

        Raises:
            ValidationError: If title is empty or whitespace-only

        Side Effects:
            - Increments next_id
            - Adds task to internal storage
        """

    def get(task_id: int) -> Task | None:
        """
        Retrieve task by ID.

        Args:
            task_id: Task identifier

        Returns:
            Task if found, None otherwise
        """

    def get_all() -> list[Task]:
        """
        Retrieve all tasks.

        Returns:
            List of all tasks (empty list if none exist)
            Order: Sorted by ID ascending
        """

    def update(task_id: int, title: str | None = None,
               description: str | None = None) -> Task:
        """
        Update existing task.

        Args:
            task_id: Task identifier
            title: New title (None = keep existing)
            description: New description (None = keep existing)

        Returns:
            Updated Task object

        Raises:
            TaskNotFoundError: If task_id doesn't exist
            ValidationError: If provided title is empty

        Behavior:
            - None values preserve existing data
            - Empty string is valid for description, invalid for title
        """

    def delete(task_id: int) -> None:
        """
        Delete task by ID.

        Args:
            task_id: Task identifier

        Raises:
            TaskNotFoundError: If task_id doesn't exist

        Side Effects:
            - Removes task from storage
            - ID is not reused (next_id never decrements)
        """

    def toggle_complete(task_id: int) -> Task:
        """
        Toggle task completion status.

        Args:
            task_id: Task identifier

        Returns:
            Updated Task object

        Raises:
            TaskNotFoundError: If task_id doesn't exist

        Behavior:
            - If complete → incomplete
            - If incomplete → complete
        """
```

**Exception Types**:

```python
class ValidationError(Exception):
    """Raised when input validation fails (e.g., empty title)"""
    pass

class TaskNotFoundError(Exception):
    """Raised when task ID doesn't exist in storage"""
    pass
```

### Console Interface Contract

**File**: `src/ui/console.py`

**Responsibilities**:
- Format and display messages with colors
- Print task lists with visual formatting
- Provide color constants and utilities

**Public Functions**:

```python
def print_header(text: str) -> None:
    """Display section header with separator lines (cyan)"""

def print_success(message: str) -> None:
    """Display success message (green)"""

def print_error(message: str) -> None:
    """Display error message (red)"""

def print_prompt(text: str) -> None:
    """Display input prompt (yellow)"""

def print_task(task: Task) -> None:
    """
    Display single task with formatted output:
    - Status symbol (✓ green or ○ yellow)
    - ID and title
    - Description (gray, indented) if present
    """

def print_task_list(tasks: list[Task]) -> None:
    """
    Display list of tasks with header and count.
    Shows "No tasks found" if list is empty.
    """
```

### Menu Interface Contract

**File**: `src/ui/menu.py`

**Responsibilities**:
- Display main menu
- Capture and parse user input
- Route menu choices to appropriate operations
- Handle input errors gracefully

**Public Functions**:

```python
def display_menu() -> None:
    """Display main menu options"""

def get_menu_choice() -> int:
    """
    Prompt for menu selection (1-6).

    Returns:
        Valid menu choice (1-6)

    Behavior:
        - Loops until valid input received
        - Shows error for non-numeric or out-of-range input
        - Never crashes on invalid input
    """

def get_task_input() -> tuple[str, str]:
    """
    Prompt for task title and description.

    Returns:
        (title, description) tuple

    Behavior:
        - Loops until non-empty title provided
        - Description can be empty (press Enter)
        - Shows error for empty title
    """

def get_task_id() -> int:
    """
    Prompt for task ID.

    Returns:
        Task ID as integer

    Behavior:
        - Loops until valid integer provided
        - Shows error for non-numeric input
    """
```

## Testing and Validation Strategy

### Validation Approach

**Method**: Manual testing against specification success criteria
**Rationale**: No test framework required per constitution (standard library only). Manual testing sufficient for Phase I scope.

### Test Scenarios (Mapped to Success Criteria)

#### SC-001: Task Addition Speed (<15 seconds)

**Test**:
1. Launch application
2. Select "Add Task"
3. Enter title "Test task"
4. Enter description "Test description"
5. Confirm task created

**Pass Criteria**: Complete in under 15 seconds from menu selection to confirmation message

#### SC-002: Visual Task Distinction

**Test**:
1. Add 3 tasks
2. Mark task 2 as complete
3. View task list

**Pass Criteria**:
- Complete task shows green "✓" symbol
- Incomplete tasks show yellow "○" symbol
- Clear visual difference between states

#### SC-003: All Five Core Operations

**Test**: Execute full workflow:
1. Add task ("Buy groceries")
2. View tasks (confirm task appears)
3. Update task (change title to "Buy groceries today")
4. Mark complete (toggle status)
5. Delete task (remove task)
6. View tasks (confirm empty list)

**Pass Criteria**: All operations complete successfully without errors

#### SC-004: Invalid Input Handling (100% reliability)

**Test Cases**:

| Invalid Input | Expected Behavior |
|---------------|-------------------|
| Empty task title | Display "Title is required", prompt again |
| Non-existent task ID (99) | Display "Task ID 99 not found", return to menu |
| Non-numeric ID ("abc") | Display "Invalid ID format", return to menu |
| Invalid menu choice (0, 7, "x") | Display "Invalid choice. Please select 1-6", prompt again |
| Ctrl+C interrupt | Application exits cleanly (no stack trace visible) |

**Pass Criteria**: Application never crashes, always shows clear error message and recovers

#### SC-005: Performance with 100+ Tasks

**Test**:
1. Add 100 tasks (can use loop or repeated adds)
2. View task list
3. Update task ID 50
4. Delete task ID 75
5. Mark task ID 25 complete

**Pass Criteria**: All operations complete in <1 second (no noticeable lag)

#### SC-006: Consistent Formatting

**Test**: Execute all operations and observe console output

**Pass Criteria**:
- Consistent header formatting (cyan separators)
- Aligned menu options
- Readable task list (columns aligned)
- Appropriate color usage (no excessive or confusing colors)
- Clear visual hierarchy

#### SC-007: Menu Usability Without Documentation

**Test**: Ask a new user (unfamiliar with app) to:
1. Add a task
2. View their tasks
3. Mark a task complete

**Pass Criteria**: User completes all tasks without needing to ask for help or read documentation

### Edge Case Validation

| Edge Case | Test Procedure | Expected Behavior |
|-----------|----------------|-------------------|
| Very long title (1000+ chars) | Enter 1000-character title | Accept and display (may truncate in list view) |
| Unicode characters | Enter "Café ☕ Task" | Display correctly with special characters |
| Empty description | Press Enter without input | Accept empty description, don't display in task view |
| Task ID gaps | Delete task 2, add new task | New task gets next sequential ID (not reused ID 2) |
| Maximum ID | Create tasks until ID exceeds 1000 | Continue working (Python int has no practical limit) |

### Quality Gate Validation

#### Gate 1: Clean Environment Execution

**Command**:
```bash
# Fresh clone simulation
rm -rf .venv
uv sync
uv run python src/main.py
```

**Pass Criteria**:
- Application launches without errors
- All features work correctly
- No missing dependencies
- No import errors

#### Gate 2: Graceful Error Handling

**Test Script**:
1. Launch app
2. Add task with empty title → Should show error, not crash
3. Update task ID 999 → Should show error, not crash
4. Mark complete task ID "abc" → Should show error, not crash
5. Enter menu choice "x" → Should show error, not crash
6. Press Ctrl+C → Should exit cleanly

**Pass Criteria**: Application never crashes, shows appropriate error messages

#### Gate 3: Human Readability

**Review Checklist**:
- [ ] All functions under 20 lines
- [ ] Function names describe purpose clearly
- [ ] Variable names are descriptive (no `x`, `temp`, `data`)
- [ ] PEP 8 compliance (use `black` formatter)
- [ ] No commented-out code
- [ ] No unused imports
- [ ] Module docstrings explain purpose
- [ ] Public function docstrings document parameters, returns, raises

### Validation Documentation

**Location**: `specs/001-console-todo-app/quickstart.md`

**Contents**:
- How to run the application
- Manual test scenarios (copy of SC-001 through SC-007)
- Expected outputs for each test
- Checklist for quality gates

## Implementation Phases (for /sp.tasks)

### Phase 1: Foundation (P1 - MVP)

**Scope**: User Story 1 (Create and View Tasks)

**Deliverables**:
- Task model (`src/models/task.py`)
- TaskManager with create() and get_all() (`src/services/task_manager.py`)
- Console formatting utilities (`src/ui/console.py`)
- Basic menu system (`src/ui/menu.py`)
- Main application loop (`src/main.py`)
- Dependency setup (add colorama to pyproject.toml)

**Validation**: User can add tasks and view them with colored output

### Phase 2: Status Management (P2)

**Scope**: User Story 2 (Mark Complete/Incomplete)

**Deliverables**:
- TaskManager.toggle_complete() method
- Menu option for marking tasks
- Visual status indicators (✓ and ○ symbols with colors)

**Validation**: User can toggle task completion status

### Phase 3: Task Updates (P3)

**Scope**: User Story 3 (Update Task Details)

**Deliverables**:
- TaskManager.update() method
- Menu option for updating tasks
- Input handling for partial updates

**Validation**: User can update task title and description

### Phase 4: Task Deletion (P4)

**Scope**: User Story 4 (Delete Tasks)

**Deliverables**:
- TaskManager.delete() method
- Menu option for deleting tasks

**Validation**: User can delete tasks by ID

### Phase 5: Polish & Validation

**Scope**: Edge cases, error handling, quality gates

**Deliverables**:
- Comprehensive input validation
- Error handling for all edge cases
- Quickstart guide
- Final quality gate validation

**Validation**: All success criteria met, all quality gates passed

## Complexity Tracking

No constitutional violations detected. All complexity is justified and minimal:

| Potential Concern | Justification | Status |
|-------------------|---------------|--------|
| External dependency (colorama) | Required for cross-platform color support per spec; lightweight with zero sub-dependencies | ✅ APPROVED |
| Three-layer architecture | Minimal architecture for separation of concerns; simpler alternatives (single file) would violate constitution | ✅ APPROVED |
| Five source files | Smallest structure supporting clean separation; each file has single responsibility | ✅ APPROVED |

## References

**Console Formatting Research**:
- [Colorama GitHub](https://github.com/tartley/colorama)
- [Colorama PyPI](https://pypi.org/project/colorama/)
- [Making Your CLI Applications Pop with Styled Outputs](https://dev.to/kelseyroche/making-your-cli-applications-pop-with-styled-outputs-2dl6)

**Project Artifacts**:
- [Feature Specification](./spec.md)
- [Constitution](./.specify/memory/constitution.md)
- [Requirements Checklist](./checklists/requirements.md)
