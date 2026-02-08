"""
Chat API: Natural language task management via OpenRouter agents
Endpoint: POST /api/{user_id}/chat
Handles stateless chat with user isolation, tool orchestration, and message persistence
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, Field

from ..api.deps import get_current_user
from ..database.database import get_session
from ..services.chat_service import ChatService, ChatRequest, ChatResponse
from ..models.conversation import Conversation
from ..models.message import Message

router = APIRouter()


# ============================================================================
# Request/Response Schemas
# ============================================================================

class ChatRequestSchema(BaseModel):
    """Schema for incoming chat request"""
    conversation_id: Optional[str] = Field(None, description="Existing conversation UUID; null = create new")
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    language_hint: Optional[str] = Field("en", description="Language preference: 'en' or 'ur'")


class ToolCallRecordSchema(BaseModel):
    """Tool call execution record"""
    name: str
    arguments: Dict[str, Any]


class MessageRecordSchema(BaseModel):
    """Single message record in conversation"""
    id: str
    role: str  # "user" or "assistant"
    content: str
    created_at: str


class ChatResponseSchema(BaseModel):
    """Response from chat endpoint"""
    conversation_id: str
    assistant_message: str
    tool_calls: List[ToolCallRecordSchema] = []
    messages: List[MessageRecordSchema]
    action_metadata: Optional[Dict[str, Any]] = None


# ============================================================================
# Chat Endpoint
# ============================================================================

@router.post("/{user_id}/chat", response_model=ChatResponseSchema, status_code=status.HTTP_200_OK)
async def chat_endpoint(
    user_id: str,
    request: ChatRequestSchema,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> ChatResponseSchema:
    """
    POST /api/{user_id}/chat

    Send a natural language message and receive AI-driven task management response.

    **Request:**
    - `conversation_id` (optional): UUID of existing conversation; null creates new
    - `message` (required): User's natural language input (English or Roman Urdu)
    - `language_hint` (optional): "en" for English, "ur" for Roman Urdu

    **Response:**
    - `conversation_id`: UUID of active conversation
    - `assistant_message`: AI response (can include task results, clarifications, confirmations)
    - `tool_calls`: List of executed tool calls (task operations)
    - `messages`: Full message history (user and assistant messages in order)

    **Features:**
    - Stateless context: Last 10 messages fetched from database on each request
    - User isolation: user_id in path must match authenticated user
    - Multi-language: English and Roman Urdu support
    - Tool orchestration: Automatic task CRUD via agent reasoning

    **Error Handling:**
    - 401: Unauthorized (invalid or missing JWT)
    - 403: Forbidden (user_id mismatch)
    - 400: Bad request (invalid message or schema)
    - 503: Service unavailable (OpenRouter API down)

    **Example:**
    ```
    POST /api/user-123/chat
    Authorization: Bearer <jwt_token>

    {
      "conversation_id": null,
      "message": "Add a task to buy groceries due tomorrow",
      "language_hint": "en"
    }

    Response:
    {
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "assistant_message": "I've added 'buy groceries' to your task list with a due date of tomorrow.",
      "tool_calls": [
        {"name": "add_task", "arguments": {"title": "buy groceries", "due_date": "2026-02-08"}}
      ],
      "messages": [
        {"id": "...", "role": "user", "content": "Add a task to buy groceries due tomorrow", "created_at": "..."},
        {"id": "...", "role": "assistant", "content": "I've added 'buy groceries'...", "created_at": "..."}
      ]
    }
    ```
    """
    # 1. Verify user_id matches authenticated user (prevent cross-user access)
    if current_user.get("id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to chat for this user"
        )

    # 2. Parse conversation_id if provided
    conversation_id: Optional[UUID] = None
    if request.conversation_id:
        try:
            conversation_id = UUID(request.conversation_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation_id format"
            )

    # 3. Validate language hint
    if request.language_hint not in ["en", "ur"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="language_hint must be 'en' or 'ur'"
        )

    # 4. Create chat service and process message
    try:
        chat_service = ChatService(session)
        chat_request = ChatRequest(
            message=request.message,
            conversation_id=conversation_id,
            language_hint=request.language_hint
        )

        # Stateless chat processing (context fetched from DB)
        response = await chat_service.process_chat_message(
            user_id=user_id,
            request=chat_request
        )

        # Convert to response schema
        return ChatResponseSchema(
            conversation_id=response.conversation_id,
            assistant_message=response.assistant_message,
            tool_calls=[
                ToolCallRecordSchema(**tc) if isinstance(tc, dict) else tc
                for tc in response.tool_calls
            ] if response.tool_calls else [],
            messages=response.messages,
            action_metadata=response.action_metadata
        )

    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Log error details (in production, use structured logging)
        print(f"Chat error: {str(e)}")

        # Return 503 if OpenRouter is unavailable
        if "openrouter" in str(e).lower() or "api" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable. Please try again later."
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your chat request"
        )


# ============================================================================
# Health Check & Utility Endpoints (optional)
# ============================================================================

@router.get("/{user_id}/chat/messages", status_code=status.HTTP_200_OK)
async def get_chat_messages(
    user_id: str,
    conversation_id: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    GET /api/{user_id}/chat/messages?conversation_id={conv_id}

    **T034 FIX**: Fetch existing messages from database for re-hydration on page refresh.
    Retrieves conversation_id from localStorage and syncs UI state with database history.

    Returns all messages for a specific conversation.
    """
    if current_user.get("id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if not conversation_id:
        return {"messages": []}

    try:
        from ..models.conversation import Conversation
        from ..models.message import Message
        from sqlmodel import select

        # Verify conversation belongs to user
        conv_stmt = select(Conversation).where(
            (Conversation.id == UUID(conversation_id)) &
            (Conversation.user_id == user_id)
        )
        conversation = session.exec(conv_stmt).first()

        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        # Fetch all messages for this conversation
        msg_stmt = select(Message).where(
            Message.conversation_id == UUID(conversation_id)
        ).order_by(Message.created_at.asc())

        messages = session.exec(msg_stmt).all()

        return {
            "messages": [
                {
                    "id": str(msg.id),
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat(),
                }
                for msg in messages
            ]
        }

    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation_id format")
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch messages")


@router.get("/{user_id}/chat/conversations", status_code=status.HTTP_200_OK)
async def list_conversations(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    GET /api/{user_id}/chat/conversations

    List all conversations for authenticated user.
    """
    if current_user.get("id") != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    # TODO: Implement conversation listing with pagination
    return []
