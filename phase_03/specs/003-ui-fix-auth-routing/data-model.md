# Frontend Data Structures: UI Fidelity and Auth Routing Fixes

## Overview
Client-side data structures and state management for UI and routing fixes in the Plannoir frontend application.

## Application State Structure
```typescript
interface AppState {
  // Authentication state
  auth: {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  };

  // UI state
  ui: {
    isNavOpen: boolean;
    currentRoute: string;
    loadingStates: {
      tasks: boolean;
      auth: boolean;
      pages: Record<string, boolean>;
    };
  };

  // Task data (cached in state)
  tasks: Task[];
}

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

## Component State Structures

### Layout Component States
```typescript
interface RootLayoutState {
  metadata: {
    title: string;
    description: string;
    themeColor: string;
  };
  children: React.ReactNode;
}

interface ClientLayoutState {
  isMounted: boolean;
  navOpen: boolean;
  animationReady: boolean;
}
```

### Authentication State
```typescript
interface AuthState {
  // Sign In form state
  signInForm: {
    email: string;
    password: string;
    rememberMe: boolean;
    loading: boolean;
    error: string | null;
  };

  // Sign Up form state
  signUpForm: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    loading: boolean;
    error: string | null;
  };

  // Auth session state
  session: {
    user: User | null;
    token: string | null;
    expiresAt: string | null;
  };
}

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  rememberMe?: boolean;
}
```

### Navigation State
```typescript
interface NavigationState {
  isMobile: boolean;
  isScrolled: boolean;
  activeLink: string;
  mobileMenuOpen: boolean;
  authModalOpen: boolean;
}
```

## Route Structure Data
```typescript
interface RouteConfig {
  path: string;
  component: React.ComponentType;
  requiresAuth: boolean;
  public: boolean;
  title: string;
}

const routeMap: RouteConfig[] = [
  { path: '/', component: HomePage, requiresAuth: false, public: true, title: 'Home' },
  { path: '/auth/signin', component: SignInPage, requiresAuth: false, public: false, title: 'Sign In' },
  { path: '/auth/signup', component: SignUpPage, requiresAuth: false, public: false, title: 'Sign Up' },
  { path: '/features', component: FeaturesPage, requiresAuth: false, public: true, title: 'Features' },
  { path: '/use-cases', component: UseCasesPage, requiresAuth: false, public: true, title: 'Use Cases' },
  { path: '/dashboard', component: DashboardPage, requiresAuth: true, public: false, title: 'Dashboard' },
];
```

## CSS Configuration Data
```typescript
interface TailwindConfig {
  content: string[];
  theme: {
    extend: {
      colors: {
        'deep-black': string;      // #0a0a0a
        'pink-red': string;        // #e11d48
      };
      animation: Record<string, string>;
      keyframes: Record<string, Record<string, string>>;
    };
  };
  plugins: any[];
}

const expectedContentPaths = [
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
];
```

## Context Providers

### Auth Context
- Manages authentication state and session
- Provides sign in/up/out functions
- Handles JWT token storage and retrieval
- Exposes authentication status

### Theme Context
- Manages color scheme (light/dark)
- Handles theme persistence
- Provides theme switching functionality
- Maintains the "Fliki-style" aesthetic

### Layout Context
- Manages layout state (mobile menu, etc.)
- Coordinates between server and client layouts
- Maintains consistent layout behavior across components

## API Response Structures (for UI state updates)
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

## Session Storage Schema
- Session data: Stored using Better Auth's secure storage
- UI preferences: LocalStorage with encryption
- Temporary form data: In-memory React state
- Route persistence: SessionStorage with TTL for auth state
- Error states: In-memory component state