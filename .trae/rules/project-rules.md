# Project Rules & Engineering Standards

This document serves as the absolute single source of truth for design consistency, coding standards, project workflows, and engineering excellence.

## 1. Design System & Accessibility

### Design Tokens
We enforce a complete design-token system. Hardcoded values are strict violations.
- **Colors**: Use semantic names (`bg-primary`, `text-destructive`). See `tailwind.config.ts`.
- **Spacing**: Use standard Tailwind spacing scale (`p-4`, `m-6`).
- **Radii**: Use `rounded-lg` (`var(--radius)`) as the standard.
- **Typography**: Follow the strict hierarchy:
    - **H1**: `text-3xl font-bold tracking-tight`
    - **H2**: `text-2xl font-semibold tracking-tight`
    - **H3**: `text-xl font-semibold tracking-tight`
    - **H4**: `text-lg font-medium`

### Accessibility (WCAG AA)
Strict adherence to WCAG AA standards is required.
- **Contrast**: Ensure all text meets 4.5:1 contrast ratio.
- **Keyboard Navigation**: All interactive elements must be focusable and usable via keyboard (`Tab`, `Enter`, `Space`, `Esc`).
- **Focus Styling**: Never remove focus outline without providing a distinct alternative.
- **ARIA**: Use semantic HTML first (`<button>`, `<nav>`). Use ARIA roles/attributes only when necessary.
- **Screen Readers**: All images must have `alt` text. Icons must be hidden (`aria-hidden="true"`) or labeled.

## 2. Component Architecture

### API Contract
Every UI component must have a formal, documented API contract:
- **Props**: Explicitly typed interfaces.
- **States**: Defined visual states (Idle, Hover, Active, Focus, Disabled).
- **Loading**: Built-in loading skeletons/spinners.
- **Disabled**: Visual and functional disabled states.
- **ARIA**: Documented expected ARIA roles and labels.

### Storybook
- **Mandatory**: Every presentational component must have a Storybook story.
- **Visual Regression**: Stories are used for visual regression snapshots.

## 3. Development Standards

### TypeScript
- **Strict Mode**: Enabled in `tsconfig`.
- **No Any**: Usage of `any` is strictly prohibited. Use `unknown` or proper generics if strictly necessary.

### State Management
- **Server State**: Use **React Query** (TanStack Query) for all async data.
    - Define clear keys (`['users', id]`).
    - Document caching and invalidation rules.
- **Client State**: Local state (useState) for UI ephemeral state. Context for feature-scoped global state.

### Formatting & Internationalization
- **Formatting**: Dates, Currency, and Numbers must use `Intl` API or `date-fns` with proper locale support.
- **Linting**: Prettier for formatting, ESLint for code quality.

## 4. Security & Permissions (RBAC)

### Admin vs User Separation
- **RBAC**: Implement strict Role-Based Access Control.
- **Audit Logs**: **MANDATORY** for all sensitive admin actions (Ban, Delete, Edit Protected Data). Log: `Who`, `What`, `When`, `Reason`.

### Correspondence Scenarios
When working on any component related to both **Admin** and **User**:
1.  **Scenario Mapping**: Explicitly outline:
    - *User Perspective*: What they see/do.
    - *Admin Perspective*: Monitoring, Moderation controls, Overrides.
2.  **Admin Controls**: Always propose controls for suspension, editing, and reverting.
3.  **Implementation**: Optimize for shared types but distinct, secure endpoints.

## 5. Quality Assurance & CI/CD

### Testing
- **Unit**: Vitest for utility logic and isolate hooks.
- **Integration**: React Testing Library for component interactions.
- **E2E**: Playwright for critical user flows.
- **Policy**: Merges are **BLOCKED** on test failures.

### CI Pipeline
- **Linting**: ESLint check.
- **Typechecking**: `tsc --noEmit`.
- **Accessibility**: Automated a11y tests.
- **Storybook**: Build and snapshot.
- **Bundle Size**: Enforce limits to prevent bloat.

### Pre-Commit
- **Husky + lint-staged**: Enforce formatting and linting before commit.

## 6. Operations & Monitoring

### Performance
- **Code Splitting**: Route-based splitting is mandatory. Lazy load heavy components.

### Monitoring
- **Error Logging**: Sentry (or equivalent) for global error tracking.
- **Boundary**: All features must be wrapped in Error Boundaries that log to monitoring.

## 7. Documentation Policy
Every feature MUST have:
- **Docs**: `documentation/` entry.
- **PR Template**: Filled out completely.
- **Contribution Guide**: Instructions for future devs.
