# Phase 0 Research: Agentic Chatbot Technology Stack & Best Practices

**Date**: 2026-02-08
**Feature**: 014-agentic-chatbot
**Purpose**: Resolve technical unknowns and document architecture choices

## Executive Summary

This document consolidates research findings on:
1. OpenAI Agents SDK best practices for task-driven applications
2. MCP (Model Context Protocol) tool design and contract validation
3. SQLModel + Neon PostgreSQL integration patterns
4. Real-time synchronization strategies (WebSocket vs polling)
5. Roman Urdu language processing for task parsing
6. FastAPI stateless architecture patterns

All findings inform the implementation plan and Phase 1 design artifacts.

---

## 1. OpenAI Agents SDK Implementation

### Decision: Use OpenAI Agents SDK for Tool Orchestration

**Context**: Spec requires the system to interpret user intent and execute MCP tools (TaskToolbox, ContextManager, RomanUrduHandler).

**Options Considered**:
1. **OpenAI Agents SDK** (Selected)
   - Official SDK for orchestrating agent loops
   - Native support for MCP tools
   - Handles function calling and response synthesis automatically
   - Cost-efficient when paired with OpenRouter

2. LangChain/LangGraph
   - More framework overhead
   - Requires manual tool calling implementation
   - Overkill for simple task CRUD domain

3. Custom agent loop
   - Full control but high maintenance burden
   - Reinvents tool calling logic already solved by Agents SDK
   - Not recommended for MVP

**Rationale**:
- OpenAI Agents SDK is battle-tested for tool-driven workflows
- Reduces implementation complexity (no manual LLM parsing)
- Integrates seamlessly with OpenRouter for cost optimization
- Agents SDK handles retries and error recovery automatically

**Alternatives Rejected Because**:
- LangChain adds complexity without value for CRUD-only domain
- Custom implementation would require significant testing and debugging time

### Best Practices Applied

1. **System Prompt Design**
   ```
   You are a helpful task management assistant. Users can ask you to:
   - Add new tasks (e.g., "Add task: buy groceries by Friday")
   - Mark tasks complete (e.g., "Mark [task] as done")
   - Delete tasks (e.g., "Delete: [task]")
   - View tasks (e.g., "Show my tasks")
   - Update tasks (e.g., "Update [task]: change priority to high")

   You also understand Roman Urdu commands like "Mera task add kardo".
   Always respond in a friendly, conversational tone.
   After executing a tool, confirm the action with a natural language message.
   If you're unsure which task the user means, ask for clarification.
   ```

2. **Tool Calling Strategy**
   - Agents SDK automatically determines which tool to call based on user intent
   - No explicit intent classification needed; let LLM handle parsing
   - Return structured JSON from tools; let SDK format responses

3. **Context Window Management**
   - Feed last 10 messages as conversation context (fetched fresh on every request)
   - System prompt includes domain context (task management)
   - User message + context = input to agent

4. **Rate Limiting & Cost Control**
   - Cache repeated queries (last 10 messages) in short-lived in-memory buffer (10 sec)
   - Use cheaper models (e.g., gpt-4o-mini) for routine CRUD parsing
   - OpenRouter provides model fallback if primary fails

---

## 2. MCP (Model Context Protocol) Tool Design

### Decision: Implement 4 Specialized MCP Tools

**Context**: Spec requires tool-based database access exclusively; agent never queries DB directly.

**Options Considered**:
1. **4 Specialized Tools** (Selected)
   - TaskToolbox: CRUD operations
   - ContextManager: Message history retrieval
   - RomanUrduHandler: Language translation
   - ChatKit-Integrator: Frontend communication

2. Single monolithic tool
   - Would require complex parameter routing
   - Harder to test individual operations
   - Less modular

3. Per-operation tools (8+ tools)
   - Too many tool definitions
   - Agents SDK performance degrades with excessive tools
   - Harder to manage contracts

**Rationale**:
- 4 tools strike balance between modularity and management burden
- Each tool has clear responsibility and contract
- Easy to test and validate independently
- Aligns with Constitution Principle II (Tool-First Execution)

### MCP Tool Contracts

#### TaskToolbox
```json
{
  "tools": [
    {
      "name": "add_task",
      "description": "Create a new task with title and optional details",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "title": {"type": "string"},
          "description": {"type": "string", "nullable": true},
          "priority": {"enum": ["low", "medium", "high"], "default": "medium"},
          "due_date": {"type": "string", "format": "date", "nullable": true}
        },
        "required": ["user_id", "title"]
      }
    },
    {
      "name": "complete_task",
      "description": "Mark a task as completed",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "task_id": {"type": "string"}
        },
        "required": ["user_id", "task_id"]
      }
    },
    {
      "name": "delete_task",
      "description": "Delete a task permanently",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "task_id": {"type": "string"}
        },
        "required": ["user_id", "task_id"]
      }
    },
    {
      "name": "update_task",
      "description": "Update specific fields of a task",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "task_id": {"type": "string"},
          "title": {"type": "string", "nullable": true},
          "priority": {"enum": ["low", "medium", "high"], "nullable": true},
          "due_date": {"type": "string", "format": "date", "nullable": true}
        },
        "required": ["user_id", "task_id"]
      }
    },
    {
      "name": "list_tasks",
      "description": "Retrieve all tasks for the user",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "status_filter": {"enum": ["all", "pending", "completed"], "default": "all"}
        },
        "required": ["user_id"]
      }
    }
  ]
}
```

#### ContextManager
```json
{
  "tools": [
    {
      "name": "get_message_history",
      "description": "Fetch the last N messages from conversation history",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "limit": {"type": "integer", "default": 10}
        },
        "required": ["user_id"]
      }
    },
    {
      "name": "store_message",
      "description": "Persist a user or assistant message to the database",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {"type": "string"},
          "role": {"enum": ["user", "assistant"]},
          "content": {"type": "string"}
        },
        "required": ["user_id", "role", "content"]
      }
    }
  ]
}
```

#### RomanUrduHandler
```json
{
  "tools": [
    {
      "name": "parse_urdu_intent",
      "description": "Parse Roman Urdu command and return English intent",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_input": {"type": "string"}
        },
        "required": ["user_input"]
      }
    }
  ]
}
```

### Tool Validation Best Practices

1. **Input Validation**
   - All tools validate user_id matches JWT token (Security Principle III)
   - Type checking on all parameters
   - Range validation (priority must be low/medium/high)
   - Null checks on optional fields

2. **Error Responses**
   - Return HTTP 400 + descriptive error for invalid input
   - Return HTTP 404 + "task not found" for nonexistent tasks (no data leakage)
   - Return HTTP 401 for unauthorized access (user_id mismatch)
   - All errors surface user-friendly messages via agent response

3. **Response Format**
   - All tools return JSON with `success` flag and `data`/`error` fields
   - Example: `{"success": true, "data": {"task_id": "123", "title": "..."}}`
   - Agent formats this response into conversational message

---

## 3. SQLModel + Neon PostgreSQL Integration

### Decision: Use SQLModel with Connection Pooling for Neon

**Context**: Spec requires persistent storage of Tasks, Messages, and Conversations in Neon PostgreSQL.

**Options Considered**:
1. **SQLModel + Neon Connection Pool** (Selected)
   - SQLModel provides type-safe ORM with Pydantic integration
   - Neon Connection Pooling (pgBouncer) prevents connection exhaustion
   - Native PostgreSQL features (indexes, transactions)

2. Raw SQLAlchemy
   - Lower-level but more control
   - More verbose query writing
   - SQLModel is just Pydantic + SQLAlchemy wrapper

3. Prisma (TypeORM equivalent)
   - Requires Node.js runtime (we're using Python FastAPI)
   - Added deployment complexity

**Rationale**:
- SQLModel integrates Pydantic models with SQLAlchemy ORM
- Type hints in Python enable IDE support and validation
- Neon Connection Pooling optimized for serverless/stateless patterns
- Easy to write migrations and manage schema evolution

### Schema Design

```sql
-- Tasks (existing Phase II table, extended for chatbot)
CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX idx_task_user_id ON task(user_id);
CREATE INDEX idx_task_user_status ON task(user_id, status);

-- Conversations (new for Phase III)
CREATE TABLE conversation (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_conv_user_id FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX idx_conversation_user_id ON conversation(user_id);

-- Messages (new for Phase III)
CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    conversation_id INTEGER REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_msg_user_id FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX idx_message_user_timestamp ON message(user_id, timestamp DESC);
CREATE INDEX idx_message_conversation ON message(conversation_id);
```

### Connection Pooling Configuration

```python
# backend/src/services/db.py
from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = os.getenv("DATABASE_URL")  # Neon connection string with pooling enabled

# Neon automatically handles connection pooling via pgBouncer
# No explicit pool_size config needed; Neon manages it
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600    # Recycle connections after 1 hour
)

def get_session() -> Session:
    with Session(engine) as session:
        yield session
```

### Transaction Management

- **Message Persistence**: Wrap user message + task operation + assistant response in single transaction
- **Atomicity**: Either all succeed or all rollback; no orphaned messages
- **Isolation Level**: Read Committed (default Postgres) sufficient for MVP

---

## 4. Real-Time Task List Synchronization

### Decision: Use WebSocket with Polling Fallback

**Context**: Spec requires tasks to appear in Task List UI within 2 seconds of chat action.

**Options Considered**:
1. **WebSocket (Primary) + Polling (Fallback)** (Selected)
   - WebSocket: <100ms latency, bidirectional, real-time events
   - Polling fallback: Every 5 seconds check `/api/{user_id}/tasks` for updates
   - Works in all network conditions (including corporate proxies)

2. Pure Polling (every 1-2 seconds)
   - Simpler to implement
   - Higher latency (1-2s)
   - More database queries
   - Not ideal for real-time experience

3. Server-Sent Events (SSE)
   - One-way communication (server → client only)
   - Sufficient but WebSocket offers better UX with full duplex

**Rationale**:
- WebSocket achieves <2 second SLA easily
- Polling fallback ensures compatibility in restricted network environments
- Together they provide robust, universal real-time sync

### Implementation Strategy

```python
# backend/src/api/chat.py
@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """Establish WebSocket for real-time task updates"""
    await websocket.accept()

    # Verify JWT token from query param or header
    token = websocket.query_params.get("token")
    if not verify_token(token, user_id):
        await websocket.close(code=1008)  # Policy violation
        return

    try:
        while True:
            # Listen for incoming messages
            data = await websocket.receive_json()
            if data["type"] == "chat_message":
                # Process message, execute tools, get response
                response = await handle_chat(user_id, data["content"])

                # Broadcast task update to client
                await websocket.send_json({
                    "type": "chat_response",
                    "content": response["message"],
                    "tasks": response["updated_tasks"]
                })
    except WebSocketDisconnect:
        pass
```

```typescript
// frontend/src/hooks/useChat.ts
export function useChat(userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`/ws/${userId}?token=${getToken()}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_response") {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
        setTasks(data.tasks);  // Update task list instantly
      }
    };

    ws.onerror = () => {
      // Fallback to polling if WebSocket fails
      startPolling(userId);
    };

    return () => ws.close();
  }, [userId]);

  const sendMessage = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
    ws.send(JSON.stringify({ type: "chat_message", content }));
  };

  return { messages, tasks, sendMessage };
}
```

---

## 5. Roman Urdu Language Processing

### Decision: Pattern-Based Parsing with LLM Fallback

**Context**: Spec requires support for Roman Urdu commands like "Mera task add kardo", "Mera task delete kardo", "Mera tasks dikhao".

**Options Considered**:
1. **Pattern Matching + LLM Parsing** (Selected)
   - Fast pattern matching for common phrases
   - LLM fallback for ambiguous input
   - Handles variations in user phrasing

2. Full LLM parsing
   - Always use LLM to parse Urdu intent
   - More flexible but slower and costlier
   - Overkill for high-frequency operations

3. Manual mapping table
   - Fast but not extensible
   - Only works for predefined phrases

**Rationale**:
- Roman Urdu has consistent patterns for task operations
- Pattern matching is <1ms; LLM fallback handles edge cases
- Hybrid approach is cost-efficient

### Implementation

```python
# backend/src/services/roman_urdu_handler.py

URDU_PATTERNS = {
    r"mera\s+task\s+add\s+kardo.*?[:\s]+(.+)": ("add_task", ["title"]),
    r"mera\s+task\s+delete\s+kardo.*?[:\s]+(.+)": ("delete_task", ["title"]),
    r"mera\s+task\s+complete\s+kardo.*?[:\s]+(.+)": ("complete_task", ["title"]),
    r"mera\s+tasks?\s+dikhao": ("list_tasks", []),
    r"mera\s+task\s+update\s+kardo.*?[:\s]+(.+)": ("update_task", ["title"]),
}

async def parse_urdu_intent(user_input: str) -> dict:
    """Parse Roman Urdu command to structured intent"""

    # Normalize input: lowercase, trim whitespace
    normalized = user_input.lower().strip()

    # Try pattern matching first
    for pattern, (operation, params) in URDU_PATTERNS.items():
        match = re.search(pattern, normalized, re.IGNORECASE)
        if match:
            extracted = match.groups() if match.groups() else []
            return {
                "operation": operation,
                "params": {
                    params[i]: extracted[i]
                    for i in range(len(params))
                    if i < len(extracted)
                }
            }

    # Fallback: Use LLM to parse ambiguous Urdu
    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "Parse Roman Urdu task commands. Return JSON with 'operation' (add_task|delete_task|complete_task|list_tasks|update_task) and 'params' object."
        }, {
            "role": "user",
            "content": user_input
        }],
        temperature=0,
    )

    return json.loads(response.choices[0].message.content)
```

### Supported Roman Urdu Patterns

| Urdu Command | English Equivalent | Operation |
|---|---|---|
| Mera task add kardo: [title] | Add a task | add_task |
| Mera task delete kardo: [title] | Delete a task | delete_task |
| Mera task complete kardo: [title] | Mark complete | complete_task |
| Mera tasks dikhao | Show my tasks | list_tasks |
| Mera task update kardo: [title] | Update task | update_task |

---

## 6. FastAPI Stateless Architecture Patterns

### Decision: Request-Scoped Context Retrieval

**Context**: Constitution Principle I requires zero in-memory state; all context persists to Neon DB.

**Pattern**:
```python
# backend/src/api/chat.py
from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from src.models import Message

@app.post("/api/{user_id}/chat")
async def handle_chat(user_id: str, request: ChatRequest, session: Session = Depends(get_session)):
    """Stateless chat endpoint: retrieve context, process, return response"""

    # 1. Validate JWT token
    token = request.headers.get("Authorization").split(" ")[1]
    if not verify_jwt(token, user_id):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)

    # 2. Retrieve conversation context (last 10 messages)
    last_messages = session.exec(
        select(Message)
        .where(Message.user_id == user_id)
        .order_by(Message.timestamp.desc())
        .limit(10)
    ).all()

    # 3. Initialize agent with context
    agent = Agent(
        system_prompt="You are a task management assistant...",
        tools=[TaskToolbox, ContextManager, RomanUrduHandler],
        context=[m.dict() for m in reversed(last_messages)]  # Newest first
    )

    # 4. Process user input
    response = await agent.run(request.message)

    # 5. Execute tools (all database writes happen here)
    tool_results = await agent.execute_tools(response.tool_calls)

    # 6. Generate final response
    final_response = await agent.finalize(tool_results)

    # 7. Persist messages
    session.add(Message(user_id=user_id, role="user", content=request.message))
    session.add(Message(user_id=user_id, role="assistant", content=final_response))
    session.commit()

    # 8. Return response
    return {"message": final_response, "tasks": tool_results.get("updated_tasks", [])}
```

**Key Principles**:
- No process-level state (no self.session or global variables)
- Every request is independent
- Database is single source of truth
- Enables stateless deployment (Kubernetes, serverless functions)

---

## Summary: Technology Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Agent Framework | OpenAI Agents SDK | Native tool support, cost-efficient with OpenRouter |
| MCP Tools | 4 specialized tools | Balance modularity vs. management |
| Database | SQLModel + Neon PostgreSQL | Type-safe ORM, connection pooling for stateless pattern |
| Real-Time Sync | WebSocket + Polling | <2s latency, universal compatibility |
| Language Processing | Pattern Matching + LLM | Fast for common cases, flexible for edge cases |
| API Architecture | FastAPI Stateless | Constitution compliance, horizontal scaling |

---

**Next Steps**: Phase 1 design artifacts (data-model.md, contracts/, quickstart.md) will implement these research findings.
