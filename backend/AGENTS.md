# Backend AI Development Guidelines

These rules apply to `backend/`. The backend is a NestJS API organized around modular, domain-centered boundaries. Keep the architecture explicit and easy to reason about.

## Backend Stack

- NestJS 11
- TypeScript
- Prisma 7 with PostgreSQL
- Firebase Admin SDK
- Jest, Supertest, and ts-jest
- Docker multi-stage runtime on Node 22 Alpine

## Architectural Direction

Use a pragmatic hexagonal architecture inside each business module:

```text
src/modules/<module>/
  delivery/         # HTTP controllers and DTOs
  application/      # use cases, inbound ports, application errors
  domain/           # entities, domain errors, repository ports
  infrastructure/   # Prisma repositories, mappers, external adapters
  <module>.module.ts
```

Core rules:

- Controllers are transport adapters. They validate/translate HTTP concerns and delegate to use cases.
- Use cases orchestrate one application action. They should be small and depend on ports, not concrete infrastructure.
- Domain entities own invariants and domain validation.
- Infrastructure implements ports and maps persistence models to domain objects.
- Shared services such as Prisma and Firebase belong under `src/shared/`.
- Do not leak Prisma models into domain or application layers.

## Module Boundaries

- Keep features isolated by module: `events`, `session`, `health`, and future modules.
- Import across modules only through exported providers, ports, or public module APIs.
- Avoid reaching into another module's `infrastructure/` from application code.
- If a module needs another module's behavior, depend on a port or exported service rather than a concrete class.
- Avoid creating broad `shared` utilities unless at least two modules genuinely need them.

## Naming And File Conventions

- Use `kebab-case` for files and folders.
- Use `PascalCase` for classes and domain entities.
- Use `UPPER_SNAKE_CASE` for Nest injection tokens.
- Use role suffixes consistently:
  - `*.controller.ts`
  - `*.module.ts`
  - `*.guard.ts`
  - `*.repository.ts`
  - `*.mapper.ts`
  - `*.entity.ts`
  - `*.port.ts`
  - `*.dto.ts`
  - `*.error.ts`
  - `*-use-case.ts`
- Name use cases by user intent, for example `CreateEventUseCase`, not by implementation detail.
- Name ports by capability, for example `CreateEventPort`, `EventRepositoryPort`, `FirebaseTokenVerifierPort`.

## Dependency Injection

- Prefer constructor injection.
- Depend on ports/tokens in application services.
- Bind tokens to implementations in the module file using `useExisting` or `useClass`.
- Export only what other modules need.
- Keep injection tokens close to the contract they represent.

Example pattern:

```ts
{ provide: CREATE_EVENT, useExisting: CreateEventUseCase }
```

## Controllers And DTOs

- Controllers should be thin.
- Use DTOs for request body shapes and transport-level typing.
- Do not put domain invariants in controllers. Controllers may perform transport validation, but domain rules must be enforced in entities or use cases.
- Map application/domain errors to HTTP responses at the delivery boundary.
- Keep response shapes stable and explicit.
- Use guards for authentication and request enrichment.

## Use Cases

- A use case should represent one action: `create event`, `login`, `check health`.
- Accept command/input objects and return result objects.
- Do not read directly from `process.env` inside use cases unless the value is truly application policy and currently has no config abstraction. Prefer moving repeated configuration behind a provider.
- Convert raw input into domain objects before persistence.
- Catch domain errors only to translate them into application errors.
- Do not catch errors just to rethrow the same error.

## Domain Layer

- Domain entities should expose explicit factory methods such as `create` and `rehydrate`.
- Enforce invariants in the domain. Examples: required user, required event name, valid date range.
- Keep domain entities framework-agnostic. No NestJS decorators, Prisma types, Express types, or HTTP exceptions.
- Use domain-specific errors for validation failures.
- Return primitives through `toPrimitives()` when crossing boundaries.

## Persistence And Prisma

- Prisma code belongs in infrastructure repositories, mappers, or shared Prisma service.
- Use mappers to convert between Prisma records and domain entities.
- Use transactions when writing multiple related records that must remain consistent.
- Keep database naming intentional. The current schema maps tables to snake_case with Prisma models in PascalCase.
- Do not expose `PrismaService` from controllers or use cases.
- Avoid ad hoc SQL unless Prisma cannot express the query clearly or efficiently.
- When changing `schema.prisma`, update migrations or document the migration requirement.

## Authentication And Sessions

- Firebase verifies identity; the backend owns application sessions.
- Never store raw session tokens in the database. Store hashes.
- Use `SessionGuard` for authenticated endpoints.
- Enrich authenticated requests with user/session data in the guard.
- Keep session cookie names in shared constants.
- Do not trust client-provided user IDs for authenticated actions; derive user identity from the validated session.
- Keep Firebase Admin credentials server-only.

## Error Handling

- Use Nest HTTP exceptions only at delivery/application boundaries where HTTP semantics are appropriate.
- Use domain errors for business rule violations.
- Preserve clear messages and field information for validation failures.
- Avoid swallowing infrastructure errors. Let unexpected failures surface unless there is a useful translation.
- Return user-safe errors from controllers.

## Testing Strategy

- Unit tests belong in `tests/units/**`.
- Integration tests belong in `tests/integration/**`.
- E2E tests belong in `tests/e2e/**`.
- Test use cases with mocked ports.
- Test controllers with mocked use cases and guards where appropriate.
- Test persistence behavior separately when repository logic becomes non-trivial.
- Add tests for validation, authorization, error mapping, and transaction-sensitive behavior.

Useful commands:

```bash
pnpm lint
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

## API Design

- Keep routes versioned under the global prefix `api/v1`.
- Use nouns for resources: `/events`, `/session`.
- Use clear status codes: `201` for creation, `400` for validation errors, `401` for authentication failures.
- Keep BFF compatibility in mind. Frontend API routes may depend on response shapes.
- Avoid breaking public response contracts without updating frontend and tests.

## Configuration

- Server-only configuration comes from environment variables.
- Required backend variables include `DATABASE_URL`, Firebase Admin credentials, optional `SESSION_TTL_DAYS`, and `PORT`.
- Do not add default values that hide missing production configuration unless the fallback is safe.
- Never log secrets or raw tokens.

## Implementation Checklist

Before finishing backend work:

- The change respects module boundaries.
- Business rules live in domain/application, not controllers.
- Ports and injection tokens are updated if new dependencies are introduced.
- Prisma changes include mapping and migration considerations.
- Authenticated actions derive user identity from the session.
- Relevant unit/integration/e2e tests were added or updated.
- `pnpm lint`, targeted tests, or a clear explanation of what was not run is provided.
