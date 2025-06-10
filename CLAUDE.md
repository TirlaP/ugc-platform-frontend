# CLAUDE.md - Development Guidelines for UGC SaaS Platform

## Project Context
Building a UGC Agency Management Platform using:
- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Hono + TypeScript (separate repository)
- Database: PostgreSQL with Prisma ORM
- Auth: Better Auth
- State Management: Zustand
- Forms: React Hook Form + Zod
- API Client: TanStack Query

## Code Quality Principles

### 1. Clean Architecture
- Separate concerns into layers: UI, Business Logic, Data Access
- Dependencies point inward (UI → Business → Data)
- Core business logic should not depend on frameworks

### 2. SOLID Principles
- **S**ingle Responsibility: Each component/function does one thing
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Derived classes must be substitutable
- **I**nterface Segregation: Many specific interfaces over general ones
- **D**ependency Inversion: Depend on abstractions, not concretions

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into utilities
- Create reusable components
- Use custom hooks for shared state logic

### 4. Test-Driven Development
- Write tests first
- Red → Green → Refactor cycle
- Aim for >80% coverage on business logic

## File Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form components
│   └── layouts/        # Layout components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── campaigns/     # Campaign management
│   ├── creators/      # Creator management
│   └── clients/       # Client management
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── services/          # API services
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Prefer type inference where obvious
- Use enums for constants
- Avoid `any` type

### React
- Functional components only
- Use hooks for state and effects
- Memoize expensive computations
- Lazy load routes and heavy components
- Handle loading and error states

### Component Guidelines
```typescript
// Good component structure
interface ComponentProps {
  // Props with JSDoc comments
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  // Derived state
  // Event handlers
  // Effects
  // Return JSX
}
```

### State Management
- Local state for component-specific data
- Zustand for shared application state
- TanStack Query for server state
- Context for dependency injection

### API Integration
- Use TanStack Query for data fetching
- Implement proper error handling
- Add retry logic for failed requests
- Cache responses appropriately
- Implement optimistic updates

## Development Workflow

### 1. Before Starting a Feature
- Review the spec.md for requirements
- Check todo.md for current task
- Read relevant sections in CLAUDE.md
- Plan the implementation approach

### 2. Implementation Steps
- Create types/interfaces first
- Build data layer (API services)
- Create state management
- Build UI components
- Add error handling
- Write tests
- Update documentation

### 3. Code Review Checklist
- [ ] Follows SOLID principles
- [ ] No code duplication (DRY)
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Responsive design checked
- [ ] Accessibility verified
- [ ] Tests written and passing

## Common Patterns

### Protected Routes
```typescript
<ProtectedRoute roles={['ADMIN', 'STAFF']}>
  <Component />
</ProtectedRoute>
```

### API Calls
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => apiService.getResource(id),
});
```

### Form Handling
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {},
});
```

## Work Journal
Track progress and decisions in work-journal.md
