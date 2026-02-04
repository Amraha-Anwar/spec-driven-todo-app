---
name: frontend-api-orchestrator
description: Centralized API client patterns for Next.js to manage authenticated communication with a FastAPI backend, ensuring JWT token inclusion and type safety. Use this when setting up or extending the communication layer between the TypeScript frontend and Python backend.
---

# Frontend API Orchestrator

This skill standardizes the communication layer between a Next.js frontend and a FastAPI backend, ensuring all requests are authenticated and type-safe.

## Summary
A centralized API client for Next.js that manages authenticated communication with the FastAPI backend.

## Prerequisites
- **Next.js 16**: Using the App Router.
- **TypeScript**: For end-to-end type safety.
- **Better Auth Status**: A functional setup on the client side.
- **'better-auth/client'**: For retrieving and handling the JWT token.

## Implementation Instructions

### 1. Create the Central API Client
In `/lib/api.ts`, create a wrapper around the Fetch API. This acts as a **Request Interceptor**, which is a piece of code that catches every request you make and modifies it (e.g., adding headers) before it is actually sent.

```typescript
// lib/api.ts
import { authClient } from "@/lib/auth-client"; // Your better-auth setup

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(fetchOptions.headers);

  if (requiresAuth) {
    // Retrieve the session/token from Better Auth
    const { data: session } = await authClient.getSession();
    const token = session?.token; // Adjust based on your specific Better Auth config

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = "/login";
    }
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
```

### 2. Define Shared TypeScript Interfaces
To achieve end-to-end type safety, mirror your Python SQLModel schemas in TypeScript. This involves **Type Casting**, which is telling the TypeScript compiler to treat a raw data object as a specific, structured interface so you get autocomplete and error checking.

```typescript
// types/api.ts
export interface UserItem {
  id: string;
  title: string;
  description?: string;
  user_id: string; // Matches SQLModel user_id
}
```

### 3. Usage Example
```typescript
const items = await apiFetch<UserItem[]>("/items");
```

## Troubleshooting

- **Token is Null/Undefined**: If `session?.token` is missing, check if the user is actually logged in or if Better Auth is configured to store tokens in cookies rather than local memory.
- **CORS (Cross-Origin Resource Sharing) Errors**: If you see errors when your frontend at `:3000` calls your backend at `:8000`, you must update your FastAPI backend to allow the frontend's origin:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], ...)
  ```
- **Response Type Error**: If the data doesn't match your interface, ensure the Python backend is returning the exact keys expected by the TypeScript interface.

