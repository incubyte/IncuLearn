# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Code Style Guidelines
- **TypeScript**: Strict type checking enabled. Use proper interfaces/types.
- **Imports**: Use absolute imports with `@/` prefix (e.g., `import { X } from '@/components/Y'`).
- **Formatting**: Follow Next.js default style. Components use PascalCase, files use kebab-case.
- **Component Structure**: 'use client' directive for client components. Props interfaces above components.
- **API Routes**: Structured in app/api/ directory. Use proper error handling with appropriate status codes.
- **Error Handling**: Use try/catch blocks in async functions. Return proper NextResponse objects with status codes.
- **State Management**: Use React hooks (useState, useEffect) for component state.
- **MongoDB/Mongoose**: Connect using the connectToDatabase utility in lib/mongodb.ts.
- **OpenAI API**: Use the generateLearningPath utility in lib/openai.ts.