# Frontend AI Development Guidelines

These rules apply to `frontend/`. The frontend is a Next.js App Router application with a BFF layer, Firebase Web authentication, Tailwind CSS, componentized UI, Vitest, and Playwright.

## Frontend Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- React Aria Components
- Firebase Web SDK
- Vitest
- Playwright

## Architectural Direction

Use a pragmatic feature-oriented structure:

```text
app/               # routes, layouts, pages, and API routes
components/        # reusable UI grouped by responsibility
features/          # feature-specific client logic and API helpers
lib/               # shared clients, Firebase setup, framework adapters
tests/e2e/         # Playwright tests
```

Core rules:

- Keep UI rendering, feature logic, and backend communication separate.
- Browser components should call frontend feature APIs or BFF routes, not the NestJS backend directly for sensitive operations.
- Next.js API routes act as the BFF for auth-sensitive flows, cookie handling, payload normalization, and error translation.
- Keep server-only variables in route handlers or server utilities. Never expose private config through `NEXT_PUBLIC_*`.
- Prefer small, composable components over large pages with mixed concerns.

## App Router Guidelines

- Use `app/` for routes and layouts.
- Default to server components unless the component needs state, effects, browser APIs, event handlers, or client-side Firebase SDK usage.
- Add `"use client"` only at the smallest necessary boundary.
- Keep route handlers in `app/api/**/route.ts`.
- Route handlers should validate inputs, call server-side services or external APIs, and return stable JSON responses.
- Avoid mixing UI concerns into route handlers.

## BFF API Routes

The BFF layer is responsible for browser-to-backend mediation.

- Use BFF routes for operations that need cookies, server-only environment variables, token forwarding, or backend error translation.
- Read/write session cookies only in server-side route handlers.
- Forward the session cookie to the NestJS backend when calling protected endpoints.
- Normalize payloads before sending them to the backend.
- Return user-safe error messages and field-level errors when available.
- Keep BFF response shapes aligned with frontend feature APIs and tests.
- Do not call Firebase Admin from the frontend app; Admin SDK belongs to the backend.

## Components

Component organization:

- `components/atoms/`: smallest reusable UI units.
- `components/molecules/`: composed controls or small UI groups.
- `components/organisms/`: larger interactive sections.
- `components/templates/`: page-level layouts or feature compositions.
- `components/tailgrids/`: TailGrids/core primitives and wrappers.

Component rules:

- Use `PascalCase` for component names and files that export components.
- Keep components focused on rendering and local interaction.
- Extract feature calls into `features/**` instead of embedding fetch logic deep inside visual components.
- Prefer props for configuration over importing unrelated feature state.
- Keep client state local unless it must be shared.
- Avoid adding global state libraries unless the state problem clearly requires it.
- Make loading, success, and error states explicit.

## Feature Logic

- Put feature-specific API helpers in `features/<feature>/`.
- Keep request and response types near the function that uses them.
- Normalize form values before sending them to BFF routes.
- Throw typed/custom errors when UI needs status, fields, or user-facing messages.
- Keep feature helpers easy to unit test by avoiding direct DOM or React dependencies.

Example pattern:

```ts
export class CreateEventError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields?: string[],
  ) {
    super(message);
    this.name = "CreateEventError";
  }
}
```

## Naming And File Conventions

- Use `PascalCase.tsx` for React component files that export a component.
- Use `kebab-case.ts` for non-component utilities and feature APIs where that is already the local pattern.
- Use `camelCase` for variables, functions, props, and handlers.
- Prefix event handlers with `handle`, for example `handleSubmit` or `handleStatusChange`.
- Use `onX` prop names for callbacks passed into components, for example `onSuccess`.
- Use `*.test.ts` or `*.test.tsx` for Vitest tests.
- Use `*.spec.ts` for Playwright specs.

## Styling And Accessibility

- Use Tailwind utilities as the default styling approach.
- Reuse existing TailGrids/core components before creating new primitives.
- Prefer accessible components and patterns from React Aria Components when behavior is complex.
- Use semantic HTML where possible.
- Buttons must be real buttons when they trigger actions.
- Inputs should have accessible labels or an intentional accessible name.
- Keep responsive behavior intentional for mobile and desktop.
- Avoid hard-coded colors when an existing token or established class pattern exists.

## Authentication

- Use Firebase Web SDK only on the client for Google sign-in.
- Send Firebase `idToken` to the BFF login route.
- Let the BFF set the backend session token as an `httpOnly` cookie.
- Do not store backend session tokens in `localStorage`, `sessionStorage`, or React state.
- Do not expose server-only auth configuration through `NEXT_PUBLIC_*`.
- Redirect or show a clear error when authentication fails.

## Data Fetching

- For public browser-safe data, client components may call local BFF routes.
- For sensitive backend calls, route through `app/api/**`.
- Use `cache: "no-store"` for health checks or data that should not be cached.
- Keep backend base URLs in server-only env vars such as `API_URL`.
- Use `NEXT_PUBLIC_*` only for values that are safe to ship to the browser.

## Forms And Validation

- Keep forms controlled when validation, reset, or submission state matters.
- Normalize input before sending: trim strings, split tags, parse dates.
- Validate required fields at the BFF boundary and enforce final invariants in the backend domain.
- Show user-facing errors from typed feature errors.
- Disable submit buttons while submitting to prevent duplicate requests.
- Reset form state only after successful submission.

## Testing Strategy

- Use Vitest for feature helpers, normalization, error handling, and component logic when practical.
- Use Playwright for user-visible flows and responsive smoke coverage.
- Mock `fetch` in unit tests.
- Avoid testing implementation details that make refactors painful.
- Add regression tests for bug fixes.
- Keep e2e tests stable and focused on critical flows.

Useful commands:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Error Handling

- Feature helpers should convert failed BFF responses into typed errors when UI needs structured information.
- BFF routes should translate backend failures into user-safe JSON responses.
- Avoid silent failures. If a login or mutation fails, expose a recoverable user experience.
- Do not leak backend stack traces, raw infrastructure errors, or secrets to the browser.

## Performance And UX

- Keep client boundaries small to avoid unnecessary JavaScript.
- Avoid unnecessary re-renders by keeping state near where it is used.
- Use optimistic UI only when rollback behavior is clear.
- Prefer progressive enhancement: the app should handle loading and failure states gracefully.
- Maintain mobile usability; Playwright already includes a mobile project.

## Implementation Checklist

Before finishing frontend work:

- The UI calls BFF routes for sensitive operations.
- Server-only environment variables stay server-only.
- Components have clear loading, success, and error states.
- Accessibility was considered for new interactive elements.
- Feature helpers or BFF behavior have focused tests when logic changes.
- Playwright coverage is added or updated for critical user flows.
- `pnpm lint`, targeted tests, or a clear explanation of what was not run is provided.
