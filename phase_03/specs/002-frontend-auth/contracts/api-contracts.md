# API Contracts: Frontend-Backend Communication

## Overview
Contract specifications for the communication between the Plannoir frontend and backend API using JWT authentication.

## Authentication Headers
All authenticated requests must include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

The JWT token is obtained from Better Auth and must match the BETTER_AUTH_SECRET used by the backend for verification.

## API Client Implementation

### Base API Configuration
```typescript
const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### JWT Token Attachment
The API client should automatically retrieve the JWT token from Better Auth and attach it to all requests to protected endpoints.

## Frontend Routes and Backend API Mapping

### Health Check
```
GET /
```
- **Purpose**: Landing page (public)
- **Auth Required**: No
- **Response**: Static landing page content

### Dashboard Access
```
GET /dashboard
```
- **Purpose**: Task management dashboard
- **Auth Required**: Yes
- **Response**: Protected dashboard page with task management UI

### Task API Endpoints (via API client)
All the following endpoints are accessed through the frontend's API client:

#### List Tasks
```
GET /api/{user_id}/tasks
```
- **Purpose**: Retrieve all tasks for the authenticated user
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
- **Query Params**:
  - `completed`: Optional filter (true/false)
  - `limit`: Optional limit (default: 50)
  - `offset`: Optional offset (default: 0)
- **Response**: 200 with array of Task objects
- **Headers**: Authorization: Bearer <token>

#### Create Task
```
POST /api/{user_id}/tasks
```
- **Purpose**: Create a new task for the user
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
- **Request Body**:
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "completed": false
}
```
- **Response**: 201 with created Task object
- **Headers**: Authorization: Bearer <token>

#### Get Task
```
GET /api/{user_id}/tasks/{task_id}
```
- **Purpose**: Retrieve a specific task
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
  - `task_id`: UUID of the task
- **Response**: 200 with Task object
- **Headers**: Authorization: Bearer <token>

#### Update Task
```
PUT /api/{user_id}/tasks/{task_id}
```
- **Purpose**: Update a specific task
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
  - `task_id`: UUID of the task
- **Request Body**:
```json
{
  "title": "Task title",
  "description": "Task description",
  "completed": false
}
```
- **Response**: 200 with updated Task object
- **Headers**: Authorization: Bearer <token>

#### Delete Task
```
DELETE /api/{user_id}/tasks/{task_id}
```
- **Purpose**: Delete a specific task
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
  - `task_id`: UUID of the task
- **Response**: 204 No Content
- **Headers**: Authorization: Bearer <token>

#### Toggle Task Completion
```
PATCH /api/{user_id}/tasks/{task_id}/toggle
```
- **Purpose**: Toggle the completion status of a task
- **Auth Required**: Yes
- **Path Params**:
  - `user_id`: UUID from JWT sub claim
  - `task_id`: UUID of the task
- **Response**: 200 with updated Task object
- **Headers**: Authorization: Bearer <token>

## Error Handling

### Frontend Error Responses
The frontend should handle the following backend responses:

- **401 Unauthorized**: Invalid or expired JWT token
  - Action: Redirect to login page
- **403 Forbidden**: Valid JWT but wrong user context
  - Action: Show access denied message
- **404 Not Found**: Resource doesn't exist
  - Action: Show not found page/message
- **422 Validation Error**: Malformed request data
  - Action: Show validation error messages
- **Network Errors**: Connectivity issues
  - Action: Show connection error message

## Frontend Components API

### Auth Provider Interface
```typescript
interface AuthProvider {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}
```

### API Service Interface
```typescript
interface ApiService {
  getTasks: () => Promise<Task[]>;
  createTask: (taskData: CreateTaskRequest) => Promise<Task>;
  updateTask: (taskId: string, taskData: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<Task>;
}
```

## Frontend State Management Contracts

### Task Store
The frontend should maintain a consistent state for tasks that mirrors the backend:
- Local state should update optimistically on user actions
- Sync with backend API after successful requests
- Handle conflicts when backend operations fail
- Maintain loading and error states appropriately