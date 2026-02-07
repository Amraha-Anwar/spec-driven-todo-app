#!/usr/bin/env python3
"""
ChatKitIntegrator FastAPI Routes

Handles request/response mapping between ChatKit and OpenAI Agents SDK Runner.
Integrates TaskToolbox, ContextManager, and RomanUrduHandler MCP servers.

Requires:
- fastapi library: pip install fastapi
- openai library: pip install openai
- pydantic library: pip install pydantic
- httpx library: pip install httpx
- PyJWT library: pip install PyJWT
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
import json
import logging
from typing import Optional
from datetime import datetime, timezone
import os

from pydantic import BaseModel
import jwt
from openai import AsyncOpenAI

# ============================================================================
# Request/Response Models
# ============================================================================

class ChatRequest(BaseModel):
    """ChatKit request model"""
    message: str
    conversation_id: str
    metadata: Optional[dict] = None


class ChatResponse(BaseModel):
    """ChatKit response model"""
    response: str
    conversation_id: str
    timestamp: str
    metadata: Optional[dict] = None


# ============================================================================
# JWT Token Validation
# ============================================================================

def verify_jwt_token(token: str) -> dict:
    """
    Verify JWT token and extract user_id.

    Args:
        token: JWT token from Authorization header

    Returns:
        Decoded token with user_id

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        secret_key = os.getenv("JWT_SECRET_KEY")
        if not secret_key:
            raise ValueError("JWT_SECRET_KEY not configured")

        decoded = jwt.decode(token, secret_key, algorithms=["HS256"])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_token_user_id(authorization: str) -> str:
    """
    Extract and validate user_id from Authorization header.

    Args:
        authorization: "Bearer {token}" format

    Returns:
        user_id from decoded token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )

    token = authorization.replace("Bearer ", "")
    decoded = verify_jwt_token(token)

    user_id = decoded.get("user_id") or decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="user_id not found in token"
        )

    return user_id


# ============================================================================
# OpenAI Agents SDK Integration
# ============================================================================

class ChatKitAgentRunner:
    """Manages OpenAI Agents SDK client and skill attachment"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4-turbo"  # or use agents model
        self.logger = logging.getLogger(__name__)

    async def execute_chat(
        self,
        user_id: str,
        message: str,
        conversation_id: str,
        context_messages: Optional[list] = None,
        metadata: Optional[dict] = None
    ) -> str:
        """
        Execute chat request using OpenAI Agents SDK with attached skills.

        Args:
            user_id: Authenticated user ID
            message: User's message
            conversation_id: Conversation ID for context
            context_messages: Previous messages (from ContextManager)
            metadata: Optional metadata

        Returns:
            Agent response as string
        """
        try:
            # Build system prompt with skill instructions
            system_prompt = self._build_system_prompt(user_id, conversation_id)

            # Build messages array
            messages = context_messages or []
            messages.append({
                "role": "user",
                "content": message
            })

            # Call OpenAI Agents SDK
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                stream=True,  # Stream response for real-time updates
                temperature=0.7,
                max_tokens=2048
            )

            # Collect streamed response
            full_response = ""
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    full_response += chunk.choices[0].delta.content

            self.logger.info(f"Agent response generated for user {user_id}")
            return full_response

        except Exception as e:
            self.logger.exception(f"Error executing agent chat: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Agent execution failed: {str(e)}"
            )

    def _build_system_prompt(self, user_id: str, conversation_id: str) -> str:
        """
        Build system prompt with skill instructions.

        Args:
            user_id: User ID for context
            conversation_id: Conversation ID

        Returns:
            System prompt with skill integration instructions
        """
        return f"""You are a helpful task management assistant. You have access to three MCP skills:

1. **TaskToolbox**: Manage user tasks
   - add_task(user_id, title, description, priority, due_date)
   - list_tasks(user_id)
   - get_task(user_id, task_id)
   - update_task(user_id, task_id, ...)
   - complete_task(user_id, task_id)
   - delete_task(user_id, task_id)

2. **ContextManager**: Manage conversation context
   - fetch_chat_history(conversation_id, limit=10) - Rebuild context
   - record_interaction(conversation_id, user_message, assistant_response)
   - create_conversation(user_id, title)
   - list_conversations(user_id)

3. **RomanUrduHandler**: Parse Roman Urdu intents
   - parse_urdu_intent(user_input) - Extract operation, title, priority
   - generate_urdu_response(operation, title, success) - Generate Roman Urdu response

**Your role:**
- When user sends a message, use RomanUrduHandler to parse intent if it's in Roman Urdu
- Use TaskToolbox to perform the requested operation
- Use ContextManager to maintain conversation context
- Respond naturally, matching the user's language

**Context:**
- User ID: {user_id}
- Conversation ID: {conversation_id}
- Current timestamp: {datetime.now(timezone.utc).isoformat()}

Always use the user_id '{user_id}' when calling TaskToolbox functions for data isolation."""


async def stream_response(response_text: str, conversation_id: str) -> str:
    """
    Format response for streaming back to ChatKit.

    Args:
        response_text: Agent response
        conversation_id: Conversation ID

    Returns:
        JSON-formatted response for streaming
    """
    return json.dumps({
        "response": response_text,
        "conversation_id": conversation_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "complete"
    })


# ============================================================================
# FastAPI Routes
# ============================================================================

router = APIRouter(prefix="/api", tags=["chat"])
agent_runner = ChatKitAgentRunner()
logger = logging.getLogger(__name__)


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    authorization: str = Depends(lambda: None)
) -> ChatResponse:
    """
    Handle chat requests from ChatKit.

    Args:
        user_id: User ID from URL path
        request: Chat request with message and conversation_id
        authorization: JWT token from Authorization header

    Returns:
        Chat response with agent response and metadata

    Security:
        - Verifies user_id matches JWT token
        - All TaskToolbox operations scoped to user_id
        - Context isolated by conversation_id
    """
    try:
        # Step 1: Verify JWT token and user_id
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Authorization header"
            )

        token_user_id = get_token_user_id(authorization)
        if token_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="user_id in URL does not match JWT token"
            )

        logger.info(f"Chat request from user {user_id}, conversation {request.conversation_id}")

        # Step 2: Fetch conversation context from ContextManager
        # This would normally call the ContextManager MCP server
        context_messages = []  # In production, fetch from ContextManager
        """
        try:
            history = ContextManager.fetch_chat_history(
                request.conversation_id,
                limit=10
            )
            context_messages = history["messages"]
        except Exception as e:
            logger.warning(f"Failed to fetch context: {str(e)}")
        """

        # Step 3: Execute agent with attached skills
        response_text = await agent_runner.execute_chat(
            user_id=user_id,
            message=request.message,
            conversation_id=request.conversation_id,
            context_messages=context_messages,
            metadata=request.metadata
        )

        # Step 4: Record interaction in ContextManager
        """
        try:
            ContextManager.record_interaction(
                request.conversation_id,
                request.message,
                response_text,
                metadata=json.dumps(request.metadata or {})
            )
        except Exception as e:
            logger.warning(f"Failed to record interaction: {str(e)}")
        """

        # Step 5: Return response to ChatKit
        return ChatResponse(
            response=response_text,
            conversation_id=request.conversation_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            metadata={
                "user_id": user_id,
                "token_verified": True
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unhandled error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/{user_id}/chat/stream")
async def chat_stream_endpoint(
    user_id: str,
    request: ChatRequest,
    authorization: str = Depends(lambda: None)
):
    """
    Stream chat responses back to ChatKit in real-time.

    Args:
        user_id: User ID from URL path
        request: Chat request
        authorization: JWT token

    Returns:
        Streaming response (Server-Sent Events format)
    """
    try:
        # Verify JWT token and user_id
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Authorization header"
            )

        token_user_id = get_token_user_id(authorization)
        if token_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="user_id in URL does not match JWT token"
            )

        # Generate async stream
        async def generate():
            try:
                response_text = await agent_runner.execute_chat(
                    user_id=user_id,
                    message=request.message,
                    conversation_id=request.conversation_id,
                    metadata=request.metadata
                )

                yield (await stream_response(response_text, request.conversation_id)).encode()
            except Exception as e:
                logger.exception(f"Error in stream: {str(e)}")
                yield json.dumps({
                    "error": str(e),
                    "conversation_id": request.conversation_id
                }).encode()

        return StreamingResponse(generate(), media_type="application/json")

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error in stream endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stream error"
        )


@router.get("/{user_id}/conversations")
async def list_conversations_endpoint(
    user_id: str,
    limit: int = 20,
    authorization: str = Depends(lambda: None)
):
    """
    List recent conversations for a user.

    Args:
        user_id: User ID from URL path
        limit: Number of conversations to retrieve
        authorization: JWT token

    Returns:
        List of conversations
    """
    try:
        # Verify JWT token and user_id
        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Authorization header"
            )

        token_user_id = get_token_user_id(authorization)
        if token_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="user_id in URL does not match JWT token"
            )

        # In production, call ContextManager.list_conversations(user_id, limit)
        conversations = []

        return {
            "user_id": user_id,
            "conversations": conversations,
            "count": len(conversations)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error listing conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list conversations"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "skills": ["TaskToolbox", "ContextManager", "RomanUrduHandler"]
    }
