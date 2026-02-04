# Quickstart Guide: Plannoir Frontend Authentication Bridge

## Overview
Get the Plannoir frontend running locally with Better Auth integration and JWT communication to the backend API.

## Prerequisites
- Node.js 18+ or higher
- pnpm or npm package manager
- Access to the backend API (running on localhost:8000 by default)
- BETTER_AUTH_SECRET (shared with backend)

## Setup Steps

### 1. Environment Configuration
```bash
# Navigate to frontend directory
cd frontend

# Copy environment template
cp .env.example .env.local

# Update the following values in .env.local:
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8000"
BETTER_AUTH_SECRET="your-shared-secret"
```

### 2. Frontend Installation
```bash
# Install dependencies
pnpm install  # or npm install

# Verify installation
pnpm run dev  # or npm run dev
```

### 3. Run the Development Server
```bash
pnpm run dev
# or
npm run dev
```

The application will be available at http://localhost:3000

## Key Features

### Authentication Flow
1. Visit the landing page at http://localhost:3000
2. Click the "Sign In" button in the navigation
3. Complete the authentication flow with Better Auth
4. Access the protected dashboard at http://localhost:3000/dashboard

### API Communication
- All authenticated API calls automatically include the JWT token
- The API client is located in `src/lib/api.ts`
- JWT tokens are attached to the Authorization header: `Authorization: Bearer <token>`

### Protected Routes
- Dashboard route (`/dashboard`) requires authentication
- Unauthenticated users are redirected to the sign-in page
- Task CRUD operations require valid JWT tokens

## Project Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing page
│   │   ├── dashboard/       # Protected dashboard
│   │   └── api/             # Client-side API routes
│   ├── components/          # React components
│   │   ├── ui/              # Shadcn/UI components
│   │   ├── auth/            # Authentication components
│   │   └── landing/         # Landing page components
│   ├── lib/                 # Utilities and API client
│   └── styles/              # Global styles
```

## Testing the Application
```bash
# Run unit tests
pnpm run test
# or
npm run test

# Run linting
pnpm run lint
# or
npm run lint

# Build for production
pnpm run build
# or
npm run build
```

## Troubleshooting
- **Auth not working**: Verify that BETTER_AUTH_SECRET matches the backend
- **API calls failing**: Check that NEXT_PUBLIC_API_URL points to the running backend
- **Styling issues**: Ensure Tailwind CSS is properly configured with the color palette
- **Redirect loops**: Confirm middleware is properly configured for protected routes