---

description: "Task list for Console TODO Application implementation"
---

# Tasks: Console TODO Application

**Input**: Design documents from `/specs/001-console-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md (available)

**Tests**: No test framework required per constitution (standard library only). Manual validation against specification success criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- All paths relative to project root (D:\phase-1\)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Add colorama dependency to pyproject.toml
- [X] T002 [P] Create src/models/ directory
- [X] T003 [P] Create src/services/ directory
- [X] T004 [P] Create src/ui/ directory

**Checkpoint**: Project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Create Task dataclass in src/models/task.py with id, title, description, is_complete attributes
- [X] T006 [P] Create ValidationError exception class in src/services/task_manager.py
- [X] T007 [P] Create TaskNotFoundError exception class in src/services/task_manager.py
- [X] T008 Create TaskManager class skeleton in src/services/task_manager.py with tasks dict and next_id counter
- [X] T009 [P] Create console color initialization in src/ui/console.py using colorama
- [X] T010 [P] Create print_header function in src/ui/console.py for cyan section headers
- [X] T011 [P] Create print_success function in src/ui/console.py for green success messages
- [X] T012 [P] Create print_error function in src/ui/console.py for red error messages
- [X] T013 [P] Create print_prompt function in src/ui/console.py for yellow input prompts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: User can add tasks with title/description and view all tasks with colored status indicators

**Independent Test**: Launch application, add tasks with titles and optional descriptions, view task list to confirm they appear with correct IDs and status indicators (✓ green for complete, ○ yellow for incomplete)

### Implementation for User Story 1

- [X] T014 [US1] Implement TaskManager.create(title, description) method in src/services/task_manager.py with title validation and ID generation
- [X] T015 [US1] Implement TaskManager.get_all() method in src/services/task_manager.py returning sorted list of tasks by ID
- [X] T016 [US1] Create print_task function in src/ui/console.py to display single task with status symbol and colors
- [X] T017 [US1] Create print_task_list function in src/ui/console.py to display all tasks or "No tasks found" message
- [X] T018 [US1] Create get_task_input function in src/ui/menu.py to prompt for title and description with validation loop
- [X] T019 [US1] Create display_menu function in src/ui/menu.py showing 6 options with cyan header
- [X] T020 [US1] Create get_menu_choice function in src/ui/menu.py with input validation loop
- [X] T021 [US1] Implement main application loop in src/main.py with menu display and option 1 (Add Task) and option 2 (View Tasks) handlers
- [X] T022 [US1] Implement option 6 (Exit) handler in src/main.py with goodbye message

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can add and view tasks

---

## Phase 4: User Story 2 - Mark Tasks Complete and Incomplete (Priority: P2)

**Goal**: User can toggle task completion status by ID with visual feedback

**Independent Test**: Create several tasks (using US1 functionality), mark specific tasks complete by ID, view updated list to confirm status changes with different visual indicators, toggle tasks back to incomplete

### Implementation for User Story 2

- [X] T023 [US2] Implement TaskManager.get(task_id) method in src/services/task_manager.py returning Task or None
- [X] T024 [US2] Implement TaskManager.toggle_complete(task_id) method in src/services/task_manager.py with TaskNotFoundError handling
- [X] T025 [US2] Create get_task_id function in src/ui/menu.py to prompt for task ID with integer validation loop
- [X] T026 [US2] Implement option 4 (Mark Complete/Incomplete) handler in src/main.py with ID input, toggle call, and success/error messages

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can add, view, and mark tasks complete

---

## Phase 5: User Story 3 - Update Task Details (Priority: P3)

**Goal**: User can update task title and description by ID

**Independent Test**: Create tasks (using US1), update their title or description by ID, view task list to confirm changes are reflected correctly, handle invalid update attempts gracefully

### Implementation for User Story 3

- [X] T027 [US3] Implement TaskManager.update(task_id, title, description) method in src/services/task_manager.py with validation and TaskNotFoundError handling
- [X] T028 [US3] Implement option 3 (Update Task) handler in src/main.py with ID input, display current values, prompt for new values, and update call

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can add, view, toggle completion, and update tasks

---

## Phase 6: User Story 4 - Delete Tasks (Priority: P4)

**Goal**: User can remove tasks by ID

**Independent Test**: Create several tasks (using US1), delete specific tasks by ID, view task list to confirm they no longer appear, verify remaining tasks are unaffected

### Implementation for User Story 4

- [X] T029 [US4] Implement TaskManager.delete(task_id) method in src/services/task_manager.py with TaskNotFoundError handling
- [X] T030 [US4] Implement option 5 (Delete Task) handler in src/main.py with ID input, delete call, and success/error messages

**Checkpoint**: All user stories should now be independently functional - full feature set complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T031 [P] Add docstrings to all public functions in src/models/task.py following PEP 257
- [X] T032 [P] Add docstrings to all public methods in src/services/task_manager.py documenting parameters, returns, raises
- [X] T033 [P] Add docstrings to all public functions in src/ui/console.py
- [X] T034 [P] Add docstrings to all public functions in src/ui/menu.py
- [X] T035 [P] Add module docstring to src/main.py explaining application purpose and usage
- [X] T036 Add KeyboardInterrupt (Ctrl+C) handling in src/main.py for clean exit
- [X] T037 Add edge case handling for very long titles (1000+ chars) in src/ui/console.py print_task function with truncation
- [X] T038 Verify PEP 8 compliance across all source files (line length, spacing, imports)
- [X] T039 Run application and validate all 7 success criteria from specs/001-console-todo-app/quickstart.md
- [X] T040 Test all edge cases documented in specs/001-console-todo-app/quickstart.md (empty description, unicode, non-numeric ID, invalid menu choice)

**Checkpoint**: Application complete, tested, and ready for delivery

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Depends on US1 for get() method and basic infrastructure
  - User Story 3 (P3): Depends on US1 for basic infrastructure, independent of US2
  - User Story 4 (P4): Depends on US1 for basic infrastructure, independent of US2/US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (Phase 2) → BLOCKS ALL
    ↓
User Story 1 (P1) → MVP - No other dependencies
    ↓
User Story 2 (P2) → Depends on US1.get() method
    ↓
User Story 3 (P3) → Depends on US1, independent of US2
    ↓
User Story 4 (P4) → Depends on US1, independent of US2/US3
    ↓
Polish (Phase 7) → Depends on all stories
```

### Within Each User Story

- **User Story 1 (P1)**:
  1. TaskManager methods (T014-T015) - can be parallel
  2. UI functions (T016-T020) - can be parallel after TaskManager
  3. Main loop integration (T021-T022) - sequential, depends on all above

- **User Story 2 (P2)**:
  1. TaskManager methods (T023-T024) - sequential (get before toggle)
  2. UI function (T025) - parallel with TaskManager
  3. Main loop integration (T026) - depends on all above

- **User Story 3 (P3)**:
  1. TaskManager method (T027) - single task
  2. Main loop integration (T028) - depends on T027

- **User Story 4 (P4)**:
  1. TaskManager method (T029) - single task
  2. Main loop integration (T030) - depends on T029

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```bash
# All can run in parallel:
Task: "Add colorama to pyproject.toml"
Task: "Create src/models/ directory"
Task: "Create src/services/ directory"
Task: "Create src/ui/ directory"
```

**Foundational Phase (Phase 2)**:
```bash
# Can run in parallel (different files):
Task: "Create Task dataclass in src/models/task.py"
Task: "Create ValidationError in src/services/task_manager.py"
Task: "Create TaskNotFoundError in src/services/task_manager.py"

# After exceptions, can run in parallel:
Task: "Create TaskManager class skeleton"
Task: "Create console.py color functions"
```

**User Story 1 (Phase 3)**:
```bash
# After TaskManager methods (T014-T015), can run in parallel:
Task: "Create print_task in src/ui/console.py"
Task: "Create print_task_list in src/ui/console.py"
Task: "Create get_task_input in src/ui/menu.py"
Task: "Create display_menu in src/ui/menu.py"
Task: "Create get_menu_choice in src/ui/menu.py"
```

**Polish Phase (Phase 7)**:
```bash
# All docstring tasks (T031-T035) can run in parallel:
Task: "Add docstrings to src/models/task.py"
Task: "Add docstrings to src/services/task_manager.py"
Task: "Add docstrings to src/ui/console.py"
Task: "Add docstrings to src/ui/menu.py"
Task: "Add docstring to src/main.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (9 tasks) - CRITICAL
3. Complete Phase 3: User Story 1 (9 tasks)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Add tasks with various titles and descriptions
   - View task list to confirm formatting and colors
   - Test empty title validation
   - Test empty description handling
   - Verify "No tasks found" message
5. Deploy/demo if ready (functional task tracker)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (13 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - 22 tasks total)
3. Add User Story 2 → Test independently → Deploy/Demo (26 tasks total)
4. Add User Story 3 → Test independently → Deploy/Demo (28 tasks total)
5. Add User Story 4 → Test independently → Deploy/Demo (30 tasks total)
6. Polish → Final validation → Production release (40 tasks total)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: User Story 1 (9 tasks)
- **Developer B**: User Story 2 (4 tasks, starts after US1 TaskManager.get() is done)
- **Developer C**: User Story 3 (2 tasks, can start after US1 basic infra is done)
- **Developer D**: User Story 4 (2 tasks, can start after US1 basic infra is done)

Stories complete and integrate independently.

---

## Task Breakdown Summary

| Phase | Tasks | Can Run in Parallel | Purpose |
|-------|-------|---------------------|---------|
| Phase 1: Setup | 4 | 3 tasks (T002-T004) | Directory structure |
| Phase 2: Foundational | 9 | 7 tasks (T005-T007, T009-T013) | Core infrastructure |
| Phase 3: US1 (P1) | 9 | 5 tasks (T016-T020 after T014-T015) | Add and view tasks (MVP) |
| Phase 4: US2 (P2) | 4 | 1 task (T025 with T023-T024) | Mark complete/incomplete |
| Phase 5: US3 (P3) | 2 | 0 tasks (sequential) | Update task details |
| Phase 6: US4 (P4) | 2 | 0 tasks (sequential) | Delete tasks |
| Phase 7: Polish | 10 | 5 tasks (T031-T035 docstrings) | Documentation and validation |
| **Total** | **40** | **16 parallelizable** | **Full application** |

---

## Notes

- **[P] tasks**: Different files, no dependencies on incomplete tasks
- **[Story] label**: Maps task to specific user story for traceability
- Each user story is independently completable and testable
- No tests required per constitution (standard library only constraint)
- Manual validation against success criteria in quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- File paths are exact and relative to project root

## Validation Checklist

Before considering implementation complete, verify:

- [ ] All 40 tasks completed and checked off
- [ ] Application runs: `uv sync && python src/main.py`
- [ ] All 7 success criteria validated (SC-001 through SC-007 from quickstart.md)
- [ ] All quality gates passed (clean environment, error handling, readability)
- [ ] Edge cases tested (unicode, long input, invalid IDs, Ctrl+C)
- [ ] No crashes on any invalid input
- [ ] PEP 8 compliance verified
- [ ] All functions have docstrings
- [ ] Code reviewed for clarity and maintainability
