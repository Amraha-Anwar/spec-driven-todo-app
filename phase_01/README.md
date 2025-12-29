# Phase 01: Spec-Driven TODO App

[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A **console-based, spec-driven TODO application** built using **Agentic Dev Stack** and **Spec-Kit Plus** principles.  
This is the **Phase 01 (Basic Level)** of a multi-phase project designed for rapid MVP development, clean code, and progressive feature expansion.

---

## Table of Contents

- [Project Overview](#project-overview)  
- [Feature Progression](#feature-progression)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Folder Structure](#folder-structure)  
- [Tech Stack](#tech-stack)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Project Overview

This project is a **command-line TODO app** that stores tasks in memory. The design is guided by **spec-driven development** using Claude Code and Spec-Kit Plus.

The application allows you to:

- Add, update, delete, and view tasks  
- Mark tasks as complete or incomplete  
- Interact via a **professional console UI** with colorized output  

This Phase 01 app forms the **foundation** of a full-stack, feature-rich TODO application planned in multiple phases.

---

## Feature Progression

### Basic Level (Core Essentials)
These features form the foundation—quick to build, essential for any MVP:

1. **Add Task** – Create new todo items  
2. **Delete Task** – Remove tasks from the list  
3. **Update Task** – Modify existing task details  
4. **View Task List** – Display all tasks  
5. **Mark as Complete** – Toggle task completion status  

### Intermediate Level (Organization & Usability)
Planned next for a more polished and practical app:

1. Priorities & Tags/Categories – Assign levels (high/medium/low) or labels (work/home)  
2. Search & Filter – Search by keyword; filter by status, priority, or date  
3. Sort Tasks – Reorder by due date, priority, or alphabetically  

### Advanced Level (Intelligent Features)
Planned future features:

1. Recurring Tasks – Auto-reschedule repeating tasks (e.g., "weekly meeting")  
2. Due Dates & Time Reminders – Set deadlines with date/time pickers; browser notifications  

---

## Installation

### Prerequisites

- Python 3.13+
- [UV](https://uv.dev/) (Python package manager)
- Claude Code CLI
- Spec-Kit Plus

### Setup

1. Create and activate a virtual environment (optional but recommended):   

```
python -m venv venv
source venv/bin/activate   # Linux / WSL
venv\Scripts\activate      # Windows

```

2. Install dependencies:   

```
uv sync
```

### Usage   
Run the console application:   

```
python src/main.py
```

### Commands

| Command   | Function                           |
|-----------|------------------------------------|
| `add`     | Add a new task                     |
| `list`    | List all tasks                     |
| `update`  | Update a task                      |
| `complete`| Mark task complete/incomplete      |
| `delete`  | Delete a task                      |
| `help`    | Show command table                 |
| `exit`    | Exit the application               |


***Tip: Enter help anytime to display all available commands.***   


### Folder Structure   

phase_01/   
├── src/   
│   └── main.py   
├── ui/   
│   ├── console.py    
│   └── menu.py   
├── models/   
│   └── task.py   
├── services/   
│   └── task_manager.py   
├── README.md   
├── CLAUDE.md   
└── .gitignore   



### Tech Stack   

   - Python 3.13+   
   - UV: Python package manager   
   - Claude Code CLI   
   - Spec-Kit Plus   
   - Colorama for colored console output   


---

