# Frontend Data Structures: Plannoir Frontend Authentication Bridge

## Overview
Client-side data structures and state management for the Plannoir frontend application.

## Authentication State
```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

## Task Data Structure (for API consumption)
```typescript
interface Task {
  id: string; // UUID
  title: string;
  description?: string;
  completed: boolean;
  user_id: string; // UUID of the owner
  created_at: string;
  updated_at: string;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  completed: boolean;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

## Navigation State
```typescript
interface NavigationState {
  isMobileMenuOpen: boolean;
  currentPath: string;
  isScrolled: boolean;
}
```

## API Response Structures
```typescript
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface ApiError {
  error: string;
  statusCode: number;
  details?: string;
}
```

## Component State Structures

### Landing Page State
```typescript
interface LandingPageState {
  activeTab: 'features' | 'use-cases' | 'pricing';
  isLoaded: boolean;
  animationProgress: number;
}
```

### Dashboard State
```typescript
interface DashboardState {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterCompleted: boolean | null; // null = all, true = completed, false = not completed
}
```

## Context Providers

### Auth Context
- Manages authentication state
- Provides login, logout, register functions
- Exposes user information
- Handles JWT token management

### Theme Context
- Manages color scheme (light/dark)
- Handles theme persistence
- Provides theme switching functionality

### API Context
- Centralizes API calls
- Handles JWT attachment to requests
- Manages loading and error states
- Provides caching mechanisms

## Storage Schema
- Session data: Stored in Better Auth's secure storage
- User preferences: LocalStorage with encryption
- Temporary data: In-memory React state
- Cached API responses: SessionStorage with TTL