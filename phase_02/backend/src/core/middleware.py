from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, status
from fastapi.responses import JSONResponse
import traceback


async def global_exception_middleware(request: Request, call_next):
    """Global exception handler middleware"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # Log the error
        print(f"Error processing request: {str(e)}")
        print(traceback.format_exc())
        
        # Return a proper error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "detail": str(e),
                "type": type(e).__name__
            }
        )