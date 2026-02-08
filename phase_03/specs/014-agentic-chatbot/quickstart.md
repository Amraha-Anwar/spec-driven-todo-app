# Phase 1 Design: Quickstart & Integration Guide

**Date**: 2026-02-08
**Feature**: 014-agentic-chatbot
**Purpose**: Setup instructions, integration checklist, and validation tests

---

## Overview

This guide enables developers to:
1. Set up the Agentic Chatbot backend (FastAPI + MCP tools)
2. Integrate the Chat Widget frontend component
3. Validate the end-to-end flow (chat → MCP tools → database → UI)
4. Deploy to production

---

## Prerequisites

### Backend Requirements
- Python 3.11+
- Neon PostgreSQL account with connection string
- OpenRouter API key (for LLM orchestration)
- Environment: Linux/macOS/Windows with Docker (optional)

### Frontend Requirements
- Node.js 18+ and npm/yarn
- Next.js 16+ already installed in phase_03/frontend
- React 18+

### Authentication
- JWT signing key (HMAC or RS256)
- User authentication system already in place (Phase II)

---

## Backend Setup

### 1. Install Dependencies

```bash
cd /mnt/d/todo-evolution/phase_03/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` file in `/backend/`:

```bash
# Database
DATABASE_URL=postgresql+psycopg://user:password@ep-xxx.neon.tech/dbname

# LLM & Agents SDK
OPENAI_API_KEY=your_openrouter_key_here
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini

# Authentication
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Server
ENVIRONMENT=development
SERVER_HOST=localhost
SERVER_PORT=8000
DEBUG=true
```

### 3. Initialize Database

```bash
# Create tables from SQLModel entities
python -m backend.scripts.init_db

# Expected output:
# ✅ Database connected to postgresql://...
# ✅ Created table: conversation
# ✅ Created table: message
# ✅ Task table already exists (Phase II)
# ✅ All migrations applied
```

**Manual migration** (if init_db fails):

```bash
psql $DATABASE_URL << 'EOF'
CREATE TABLE IF NOT EXISTS conversation (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_message_user_timestamp ON message(user_id, timestamp DESC);
CREATE INDEX idx_message_conversation ON message(conversation_id);

EOF
```

### 4. Start Backend Server

```bash
# From backend/ directory
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Expected output:
# ✅ Uvicorn running on http://0.0.0.0:8000
# ✅ Docs available at http://localhost:8000/docs
```

### 5. Verify Backend Health

```bash
# Test health endpoint
curl -X GET http://localhost:8000/health

# Expected response:
# {"status": "ok", "database": "connected"}
```

---

## Frontend Setup

### 1. Install Chat Widget Dependencies

The ChatWidget component depends on:
- React 18+
- TailwindCSS (already configured in Phase II)
- Axios or Fetch API

No additional npm packages needed (uses built-in Fetch API).

### 2. Add ChatWidget Component

Create `/frontend/src/components/ChatWidget.tsx`:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
}

export function ChatWidget() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    if (!session?.user?.id) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/ws/${session.user.id}?token=${session.user.jwt_token}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_response') {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        setTasks(data.tasks || []);
      } else if (data.type === 'task_updated') {
        setTasks(data.tasks);
      }
    };

    ws.onerror = () => {
      console.error('WebSocket error, falling back to polling');
      startPolling();
    };

    return () => ws.close();
  }, [session?.user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/${session?.user?.id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.jwt_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response.message }]);
        setTasks(data.response.tasks);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error_message}` }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = async () => {
    if (!session?.user?.id) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/${session.user.id}/tasks`, {
          headers: { 'Authorization': `Bearer ${session.user.jwt_token}` },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setTasks(data.tasks);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col border-r">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-900'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message or task..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Task List Panel */}
      <div className="w-64 p-4 bg-white overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet. Try saying "Add task: ..."</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className={`p-2 rounded border ${
                task.status === 'completed' ? 'bg-green-100 line-through' : 'bg-gray-100'
              }`}>
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### 3. Create Chat Page

Create `/frontend/src/pages/chat.tsx`:

```tsx
import { useSession, signIn } from 'next-auth/react';
import { ChatWidget } from '@/components/ChatWidget';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-screen">Not authenticated</div>;
  }

  return <ChatWidget />;
}
```

### 4. Update RootLayout (if needed)

If integrating ChatWidget into existing layout:

```tsx
// frontend/src/app/layout.tsx or pages/_app.tsx
import { ChatWidget } from '@/components/ChatWidget';

export default function RootLayout() {
  return (
    <div>
      {/* Existing layout */}
      <header>...</header>
      <main>...</main>

      {/* Chat Widget (floats or integrates based on design) */}
      <ChatWidget />
    </div>
  );
}
```

---

## Configuration

### Environment Variables (Frontend)

Create `.env.local` in `/frontend/`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# NextAuth (if using)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

### OpenRouter Configuration (Backend)

Update `backend/src/services/agent_runner.py`:

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1"),
)

async def run_agent(user_id: str, user_message: str, context: list[dict]) -> str:
    """Run OpenAI agent with MCP tools"""

    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "openai/gpt-4o-mini"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *[{"role": m["role"], "content": m["content"]} for m in context],
            {"role": "user", "content": user_message},
        ],
        tools=[...],  # MCP tool definitions
        tool_choice="auto",
        temperature=0.7,
    )

    return response.choices[0].message.content
```

---

## End-to-End Validation

### Test 1: Create Task via Chat

**Setup**: Backend running on localhost:8000, Frontend on localhost:3000, logged in user

**Steps**:
1. Click on chat input field
2. Type: "Add task: buy groceries by Friday"
3. Click Send

**Expected Result**:
- ✅ Chat displays user message
- ✅ Assistant responds: "I've added 'buy groceries' to your task list with a due date of Friday!"
- ✅ Task List panel shows "buy groceries" with status "pending"
- ✅ Database contains new row in `task` table

**Validation Query**:
```sql
SELECT * FROM task WHERE user_id = 'user123' AND title = 'buy groceries';
-- Should return 1 row with due_date = 2026-02-14 (Friday)
```

### Test 2: Complete Task via Chat

**Steps**:
1. Type: "Mark buy groceries as done"
2. Click Send

**Expected Result**:
- ✅ Chat displays confirmation message
- ✅ Task List shows "buy groceries" with strikethrough styling (status "completed")
- ✅ Database reflects status = "completed"

**Validation Query**:
```sql
SELECT status FROM task WHERE id = <task_id>;
-- Should return "completed"
```

### Test 3: Roman Urdu Command

**Steps**:
1. Type: "Mera task add kardo: doctor appointment"
2. Click Send

**Expected Result**:
- ✅ Chat assistant responds in English (e.g., "I've added 'doctor appointment' to your list!")
- ✅ Task List shows "doctor appointment"
- ✅ Database contains new task

### Test 4: Multi-Turn Context

**Steps**:
1. Add task: "Learn Python"
2. Type: "What tasks do I have?"
3. Type: "Mark the first one as done"

**Expected Result**:
- ✅ Chat #2 lists "buy groceries" and "Learn Python"
- ✅ Chat #3 correctly identifies "buy groceries" as the first task and marks it complete
- ✅ Task List updates after message #3

### Test 5: WebSocket Connection

**Steps** (in browser console):
```javascript
const token = localStorage.getItem('auth_token');
const ws = new WebSocket(`ws://localhost:8000/ws/user123?token=${token}`);
ws.onmessage = (e) => console.log(e.data);
ws.send(JSON.stringify({ type: 'chat_message', content: 'Test message' }));
```

**Expected Result**:
- ✅ Connection established (1000ms)
- ✅ Server responds with chat_response message within 3 seconds
- ✅ WebSocket remains open for multiple messages

---

## Deployment Checklist

### Phase 1 (Development)
- [ ] Backend starts without errors
- [ ] Database tables created
- [ ] Frontend ChatWidget renders
- [ ] One end-to-end test passes (e.g., create task)

### Phase 2 (Staging)
- [ ] All 5 validation tests pass
- [ ] WebSocket fallback to polling works
- [ ] Error handling tested (invalid token, DB unavailable)
- [ ] Performance: <3 second latency on chat requests

### Phase 3 (Production)
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] CORS policy configured for production domain
- [ ] JWT token validation enforced
- [ ] Logging and monitoring enabled
- [ ] Database backups configured
- [ ] Rate limiting enabled (if needed)

---

## Troubleshooting

### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'src'`

**Solution**:
```bash
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -m uvicorn src.main:app --reload
```

### Database connection fails

**Error**: `psycopg.OperationalError: connection refused`

**Solution**:
1. Verify `DATABASE_URL` in .env
2. Check Neon credentials: `psql $DATABASE_URL -c "SELECT 1;"`
3. Ensure connection pooling enabled in Neon dashboard

### WebSocket connection fails

**Error**: `WebSocket connection to 'ws://localhost:8000/ws/...' failed`

**Solution**:
1. Verify backend is running on correct port
2. Check JWT token validity
3. Fallback to polling should activate automatically

### Task doesn't appear in Task List

**Error**: Chat confirms action but Task List doesn't update

**Solution**:
1. Check browser console for fetch errors
2. Verify `/api/{user_id}/tasks` returns correct data
3. Ensure Task List component properly updates state
4. Clear browser cache and refresh

---

## Next Steps

1. **Phase 2 (Tasks)**: Generate detailed task list for implementation
2. **Implementation**: Build MCP tools, FastAPI endpoints, React components
3. **Testing**: Unit tests for tools, integration tests for endpoints
4. **Deployment**: Docker containerization, CI/CD pipeline

---

## References

- [OpenAI Agents SDK](https://github.com/openai/swiftui-gpt)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Chat Component Examples](https://nextjs.org)

---

**Document Version**: 1.0.0
**Last Updated**: 2026-02-08
**Author**: Claude Code
