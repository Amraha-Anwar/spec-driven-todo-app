# Research: Agentic AI Chatbot Integration

**Date**: 2026-02-07 | **Feature**: 010-chatbot-integration | **Phase**: 0 (Research)

## 1. OpenRouter SDK Integration

**Unknown**: Can OpenAI Agents SDK support base URL override for OpenRouter?

**Decision**: Yes. Override via client initialization parameter.

**Rationale**: OpenRouter is API-compatible with OpenAI's endpoint. OpenAI Python SDK supports custom base URL configuration through the `base_url` parameter. No wrapper needed.

**Resolution**:
```python
from openai import OpenAI
from openai.lib._agents import build_agent_executor

# Configure OpenAI client to use OpenRouter endpoint
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# OpenAI Agents SDK will use this client for LLM calls
agent = build_agent_executor(
    client=client,
    model="openrouter/auto",  # or specify model explicitly
    tools=[...]  # MCP tools registered here
)
```

**Alternatives Considered**:
- Option A (selected): Override `base_url` in OpenAI client init
- Option B: Use OpenRouter's official SDK (if available) — adds dependency complexity, less documentation
- Option C: Custom wrapper layer — over-engineered for MVP

**Dependencies**:
- `openai>=1.3.0` (supports base URL override)
- `OPENROUTER_API_KEY` environment variable

---

## 2. MCP SDK Integration with FastAPI

**Unknown**: How to integrate Official MCP SDK tools with OpenAI Agents SDK in a FastAPI backend?

**Decision**: Use MCP SDK's built-in tool discovery + OpenAI Agents SDK's tool registration.

**Rationale**: MCP SDK provides tool marshalling (serialization/deserialization). OpenAI Agents SDK accepts pre-defined tool schemas. Best practice: discover MCP tools at startup, register them with agent executor.

**Resolution**:

```python
# app/services/mcp_tools.py
from mcp.server.fastapi import MCPServer
from mcp.tools import Tool

# MCP tools exposed via MCP Server
mcp_tools: Dict[str, Tool] = {
    "add_task": Tool(...),
    "delete_task": Tool(...),
    "complete_task": Tool(...),
    "list_tasks": Tool(...),
    "update_task": Tool(...),
}

# Convert to OpenAI Agents SDK format
def get_agent_tools() -> List[dict]:
    """Convert MCP tools to OpenAI Agents SDK schema."""
    return [
        {
            "name": tool_name,
            "description": tool.description,
            "parameters": tool.schema,
            "function": lambda **kwargs: execute_mcp_tool(tool_name, **kwargs)
        }
        for tool_name, tool in mcp_tools.items()
    ]
```

**Alternatives Considered**:
- Option A (selected): Tool discovery at startup, schema registration with agent
- Option B: Dynamic tool discovery per request — adds latency
- Option C: Hardcoded tool definitions — brittle, difficult to maintain

**Dependencies**:
- `mcp-sdk>=0.1.0` (or current version)
- Tool server implementations (TaskToolbox, RomanUrduHandler, ContextManager)

---

## 3. SQLModel Relationships & Cascading

**Unknown**: How should Conversation ↔ Message FK relationships be configured for cascading delete and lazy loading?

**Decision**: Use SQLModel with `cascade="all, delete-orphan"` on Conversation.messages relationship; lazy load messages on demand.

**Rationale**: Cascade ensures message cleanup when conversation deleted. Lazy loading avoids loading all messages on conversation fetch (performance). Optional: use `back_populates` for bidirectional navigation.

**Resolution**:

```python
# app/models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    language_preference: str = "en"  # "en" or "ur"

    # Relationship: lazy load messages on access
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True  # SQLModel-specific cascading
    )

class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    tool_call_metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship: reference back to conversation
    conversation: Conversation = Relationship(back_populates="messages")
```

**Alternatives Considered**:
- Option A (selected): Cascade delete + lazy load
- Option B: Manual delete logic in service layer — more control, more code
- Option C: Eager load all messages — simple, but inefficient for large conversations

**Dependencies**:
- `sqlmodel>=0.0.12`
- `sqlalchemy>=2.0`

---

## 4. OpenAI Agents SDK Tool Registration

**Unknown**: How to register custom MCP tools with OpenAI Agents SDK?

**Decision**: Expose tools via MCP server interface; OpenAI Agents SDK consumes via standard tool schema.

**Rationale**: OpenAI Agents SDK expects tools in OpenAI Function Calling format (JSON schema). MCP SDK provides marshalling. Register tools on agent init, not per-request.

**Resolution**:

```python
# app/services/agent_runner.py
from openai.lib._agents import build_agent_executor

def initialize_agent():
    """Create and configure OpenAI Agents SDK executor."""

    client = OpenAI(
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1"
    )

    # Get MCP tools in OpenAI format
    tools_schema = get_agent_tools()  # from mcp_tools.py

    # Build agent executor with tools
    executor = build_agent_executor(
        client=client,
        model="openrouter/auto",  # or specific model
        tools=tools_schema,
        max_tokens=1000,
        temperature=0.7  # Balanced creativity/determinism
    )

    return executor

# Usage in chat endpoint:
executor = initialize_agent()
response = executor.run(
    user_message="buy milk tomorrow",
    system_prompt="You are a helpful task management assistant. Use tools to create/manage tasks.",
    user_id=current_user.id  # Pass for authorization
)
```

**Alternatives Considered**:
- Option A (selected): Register on init, reuse executor
- Option B: Create new executor per request — simpler, higher overhead
- Option C: Custom agentic loop (no SDK) — full control, massive complexity

**Dependencies**:
- `openai>=1.3.0` (Agents SDK included)

---

## 5. Neon PostgreSQL Connection Pooling

**Unknown**: How to optimize PostgreSQL connection pool for stateless FastAPI service?

**Decision**: Use SQLAlchemy engine with connection pooling (min 5, max 20 connections) + connection timeout 30s.

**Rationale**: Stateless service benefits from connection pooling to reduce overhead per request. Neon's "Pooler" mode handles connection multiplexing; set reasonable limits to avoid exhaustion.

**Resolution**:

```python
# app/models/database.py
from sqlalchemy.pool import QueuePool
from sqlmodel import create_engine, Session

# Connection pool config
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,           # Min connections in pool
    max_overflow=15,       # Max overflow connections
    pool_timeout=30,       # Timeout waiting for connection
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True,    # Test connection before use
    echo=False,
)

def get_session():
    """Dependency for FastAPI routes to inject DB session."""
    with Session(engine) as session:
        yield session
```

**Alternatives Considered**:
- Option A (selected): SQLAlchemy connection pool
- Option B: Neon's Pooler mode only — simpler, but couples to Neon
- Option C: No pooling, raw connections — high overhead, not stateless-friendly

**Dependencies**:
- `sqlalchemy>=2.0`
- `psycopg[binary]>=3.1` (PostgreSQL adapter)

---

## 6. ContextManager Token Budgeting

**Unknown**: How to implement message summarization when token budget approached?

**Decision**: Fetch last 10-15 messages; if token count approaches limit (e.g., 80% of max tokens), summarize older messages.

**Rationale**: Preserves recent context (important for conversation flow) while managing token costs. Summarization can be done by LLM or simple concatenation.

**Resolution**:

```python
# app/services/context_manager.py
from tiktoken import encoding_for_model

def fetch_conversation_context(
    conversation_id: str,
    user_id: str,
    max_messages: int = 15,
    token_limit: int = 2000,
) -> List[Message]:
    """
    Fetch conversation messages with token budgeting.

    1. Fetch last N messages from DB
    2. Count tokens
    3. If token count > 80% of limit, summarize older messages
    4. Return truncated history
    """

    # Fetch last N messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.conversation.user_id == user_id  # Verify ownership
    ).order_by(Message.created_at.desc()).limit(max_messages).all()

    # Estimate token count
    encoding = encoding_for_model("gpt-3.5-turbo")
    total_tokens = sum(len(encoding.encode(m.content)) for m in messages)

    if total_tokens > int(token_limit * 0.8):
        # Summarize older messages
        if len(messages) > 5:
            older_messages = messages[5:]
            summary = summarize_messages(older_messages)
            messages = messages[:5] + [
                Message(role="system", content=f"[Summary of older messages]\n{summary}")
            ]

    return messages

def summarize_messages(messages: List[Message]) -> str:
    """Simple concatenation or LLM-based summarization."""
    # For MVP: concatenate titles/actions
    summary = "; ".join([
        f"{m.role}: {m.content[:50]}..." for m in messages
    ])
    return summary
```

**Alternatives Considered**:
- Option A (selected): Fetch + count + summarize
- Option B: Always summarize — simpler, but loses detail unnecessarily
- Option C: Truncate without summarization — lose context

**Dependencies**:
- `tiktoken>=0.5.0` (token counting)

---

## 7. Middleware JWT Extraction & Authorization

**Unknown**: How to implement JWT extraction and user_id verification at middleware layer?

**Decision**: FastAPI middleware extracts JWT, decodes it, validates user_id, injects into request state.

**Rationale**: Single enforcement point, clean architecture, prevents unauthorized requests from reaching handlers.

**Resolution**:

```python
# app/middleware/auth.py
from fastapi import Request, HTTPException, status
import jwt

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

async def auth_middleware(request: Request, call_next):
    """Extract JWT from Authorization header, validate, inject user_id."""

    # Skip auth for health checks, docs
    if request.url.path in ["/health", "/docs", "/openapi.json"]:
        return await call_next(request)

    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = auth_header[7:]  # Remove "Bearer "

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        # Inject user_id into request state for downstream handlers
        request.state.user_id = user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    response = await call_next(request)
    return response

# In main.py
app.middleware("http")(auth_middleware)
```

**Alternatives Considered**:
- Option A (selected): Middleware extraction + injection into request.state
- Option B: Per-route dependency injection — more granular, more verbose
- Option C: Global except on routes — less flexible

**Dependencies**:
- `PyJWT>=2.8.0`
- `python-dotenv>=1.0.0` (for .env loading)

---

## 8. Error Handling Strategy

**Unknown**: How to implement immediate error responses when OpenRouter API fails?

**Decision**: Catch OpenRouter timeout/auth errors in chat endpoint; return 500 with user-friendly message immediately (no retry logic).

**Rationale**: Aligns with clarification Q4 (immediate error, user controls retry). Stateless architecture means no queuing.

**Resolution**:

```python
# app/api/chat.py
from openai import APIConnectionError, RateLimitError

@app.post("/api/{user_id}/chat")
async def chat_endpoint(user_id: str, request: ChatRequest, session: Session = Depends(get_session)):
    """Chat endpoint with error handling."""

    try:
        executor = initialize_agent()
        response = executor.run(
            user_message=request.message,
            system_prompt="...",
            user_id=user_id
        )
        return ChatResponse(
            conversation_id=response.conversation_id,
            assistant_message=response.message,
            tool_calls=response.tool_calls
        )

    except APIConnectionError as e:
        # OpenRouter unreachable
        return ChatErrorResponse(
            error="Service Unavailable",
            detail="I'm temporarily unavailable, please try again later",
            status_code=500
        )

    except RateLimitError as e:
        # Credits exhausted or rate limited
        return ChatErrorResponse(
            error="Rate Limited",
            detail="I'm experiencing high demand. Please try again later.",
            status_code=429
        )

    except Exception as e:
        logger.error(f"Unexpected error in chat: {e}")
        return ChatErrorResponse(
            error="Internal Server Error",
            detail="Something went wrong. Please try again later.",
            status_code=500
        )
```

**Alternatives Considered**:
- Option A (selected): Immediate error response
- Option B: Automatic retry with backoff — adds latency, defeats stateless principle
- Option C: Queue to background job — overkill for MVP

**Dependencies**:
- `openai>=1.3.0` (exception types)
- `python-logging>=0.5.1`

---

## Summary: All Unknowns Resolved

| Unknown | Status | Decision | Reference |
|---------|--------|----------|-----------|
| OpenRouter SDK Integration | ✅ RESOLVED | Override `base_url` in OpenAI client | Section 1 |
| MCP SDK Integration | ✅ RESOLVED | Tool discovery at startup, register with agent | Section 2 |
| SQLModel Relationships | ✅ RESOLVED | Cascade delete + lazy load on Conversation.messages | Section 3 |
| Tool Registration | ✅ RESOLVED | Register on agent init (not per-request) | Section 4 |
| Connection Pooling | ✅ RESOLVED | SQLAlchemy pool (5 min, 20 max) | Section 5 |
| Token Budgeting | ✅ RESOLVED | Fetch 10-15 messages; summarize older if needed | Section 6 |
| JWT Extraction | ✅ RESOLVED | FastAPI middleware (single enforcement point) | Section 7 |
| Error Handling | ✅ RESOLVED | Immediate friendly error (no retry logic) | Section 8 |

**Phase 0 Status**: ✅ COMPLETE

**Next**: Phase 1 (generate data-model.md, contracts/, quickstart.md with specifics from above)
