# UGC Agency Management Platform

A modern SaaS platform for agencies managing User-Generated Content (UGC) creators and clients, built with React, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Authentication**: Better Auth
- **Database ORM**: Prisma
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 20+ 
- npm or bun
- PostgreSQL database (for backend)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ugc-saas

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── features/        # Feature-based modules
├── hooks/           # Custom React hooks
├── lib/             # Core libraries and utilities
├── pages/           # Page components
├── router/          # Routing configuration
├── services/        # API service layer
├── stores/          # State management (Zustand)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4 with CSS-first configuration. All theme customization is done directly in `src/index.css` using the `@theme` directive.

### Custom Theme Variables

- **Colors**: Brand colors, success/warning states using oklch color space
- **Fonts**: System font stack with custom font families
- **Breakpoints**: Extended breakpoints including 3xl and 4xl
- **Components**: Pre-styled buttons, cards, and inputs

## Development Approach

This project follows a systematic development approach:

1. **Planning Documents**:
   - `spec.md` - Complete project specification
   - `todo.md` - 12-phase task breakdown
   - `CLAUDE.md` - Development guidelines
   - `project-roadmap.csv` - File-by-file implementation plan

2. **Architecture Principles**:
   - Clean Architecture
   - SOLID principles
   - DRY (Don't Repeat Yourself)
   - Test-Driven Development (TDD)

3. **Progress Tracking**:
   - `work-journal.md` - Daily progress notes
   - CSV roadmap with status tracking

## Environment Variables

See `.env.example` for required environment variables:

- `VITE_API_URL` - Backend API URL
- `VITE_BETTER_AUTH_URL` - Better Auth server URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth client ID

## Contributing

1. Follow the development guidelines in `CLAUDE.md`
2. Check the current phase in `todo.md`
3. Update `project-roadmap.csv` when completing files
4. Document progress in `work-journal.md`

## License

[Your License Here]
# UGC Platform Frontend
