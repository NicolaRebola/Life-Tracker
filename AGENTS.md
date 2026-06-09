# Life Tracker AI Development Guidelines

These instructions apply to the whole repository. More specific instructions live in `backend/AGENTS.md` and `frontend/AGENTS.md`; when working inside those folders, follow the local file first and then these global rules.

## Product And Engineering Intent

Life Tracker is a portfolio-grade full-stack project. Treat every change as an opportunity to show clear engineering judgment, not just to make a feature work.

- Preserve the project narrative: personal life tracking, authenticated event capture, future analytics, maintainability, and explicit trade-offs.
- Prefer simple, incremental design over speculative abstractions.
- Keep the codebase understandable for recruiters, reviewers, and future maintainers.
- Document meaningful architectural decisions when they affect module boundaries, security, persistence, or public contracts.

## Repository Structure

- `frontend/`: Next.js App Router application, BFF API routes, UI components, Firebase Web SDK, Vitest, and Playwright.
- `backend/`: NestJS API, domain/application/infrastructure modules, Prisma, Firebase Admin, Jest, Supertest, and Docker.
- `.github/workflows/`: CI pipelines for frontend and backend.
- `README.md`: public-facing portfolio documentation. Keep it accurate when architecture, commands, or scope change.

## AI Collaboration Rules

- User-facing responses must be in Spanish unless the user explicitly asks for another language.
- Read existing code before editing. Follow current patterns before introducing new ones.
- Keep changes scoped to the request. Do not perform unrelated refactors.
- Never modify or commit secrets. Files such as private keys, `.env`, credentials, or service account material must not be changed unless explicitly requested and safe.
- Do not remove user changes from the working tree. If unrelated files are dirty, ignore them.
- Prefer structured APIs, typed contracts, and framework conventions over ad hoc string manipulation.
- When behavior changes, update or add tests at the right level.
- After substantive edits, check lints for edited files and run the narrowest useful tests when practical.

## Coding Principles

- TypeScript-first: prefer explicit types at module boundaries, public functions, DTOs, and ports.
- Domain rules belong close to the domain, not in transport or UI layers.
- Avoid hidden coupling between frontend and backend. Use clear HTTP contracts and consistent payload shapes.
- Prefer dependency inversion for external systems: database, Firebase, HTTP clients, and infrastructure integrations.
- Keep errors intentional. Translate technical errors into user-facing messages at boundaries, but preserve useful context internally.
- Avoid broad catch-all fallbacks that hide real failures.
- Prefer readability over cleverness. Small duplication is acceptable when it keeps layers independent.

## Naming Conventions

- Use `kebab-case` for filenames and directories: `create-event-use-case.ts`, `event.controller.ts`.
- Use `PascalCase` for classes, React components, entities, and Nest providers.
- Use `camelCase` for variables, functions, properties, and methods.
- Use `UPPER_SNAKE_CASE` for injection tokens and constants that represent stable identifiers.
- Use clear suffixes that communicate role:
  - `.controller.ts` for HTTP controllers.
  - `.module.ts` for Nest modules.
  - `.guard.ts` for guards.
  - `.repository.ts` for repository implementations.
  - `.port.ts` for ports/contracts.
  - `.entity.ts` for domain entities.
  - `.dto.ts` for transport DTOs.
  - `.spec.ts` or `.test.ts` for tests.

## Testing Expectations

- Add unit tests for pure business logic, normalization, validation, and error mapping.
- Add integration tests for HTTP/controller behavior and boundary mapping.
- Add e2e tests for user-visible critical flows.
- Keep tests deterministic. Avoid real network calls except where explicitly required by an e2e environment.
- Prefer focused assertions over snapshot-heavy tests.
- If tests cannot be run, state that clearly in the final response.

## Security And Privacy

- Do not expose session tokens, Firebase Admin credentials, private keys, or database URLs in frontend code or public docs.
- Browser-facing variables must use `NEXT_PUBLIC_*`; server-only values must stay in server routes or backend code.
- Use `httpOnly` cookies for session tokens and avoid storing sensitive tokens in browser-accessible storage.
- Store session tokens as hashes in persistence, never as raw tokens.
- Validate inputs at the boundary and enforce invariants in the domain.

## Documentation Rules

- Keep `README.md` aligned with the actual implementation.
- Mention trade-offs when a design choice has meaningful cost or future impact.
- For new features, document setup or environment variables only if developers need them to run the project.
- Keep portfolio-facing language professional, concise, and technically accurate.

## Dependency Guidelines

- Do not add dependencies unless they clearly reduce complexity or match an existing project direction.
- Prefer framework-native solutions before adding libraries.
- If adding a dependency, update the relevant package with the package manager and keep lockfiles consistent.

## Commands

Use commands from the relevant subproject:

```bash
# Backend
cd backend
pnpm lint
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build

# Frontend
cd frontend
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```
