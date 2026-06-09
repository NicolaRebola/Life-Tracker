# Life Tracker

Life Tracker is a full-stack application for recording, organizing, and querying meaningful events from everyday life: activities, habits, personal milestones, studies, work, and any experience that adds context to a person's journey.

The project is designed as a professional portfolio piece. Its goal is not only to be a functional demo, but also to showcase technical judgment: separation of concerns, modular design, real authentication, relational persistence, automated testing, CI, and explicit trade-off analysis.

## Motivation

Most productivity tools focus on future tasks: what needs to be done, when it is due, and what state it is in. Life Tracker explores a different question: what did I do, when did it happen, in what context, and how can I turn that history into useful information?

The main motivation is to build a technical foundation for a personal tracking system that can evolve into:

- a searchable personal timeline;
- analysis of habits, focus, and energy;
- grouping by tags, projects, or life areas;
- kanban, calendar, and timeline visualizations;
- future integration with external metrics or intelligent assistants.

From a professional perspective, the project demonstrates experience with backend architecture, modern frontend development, federated authentication, data modeling, testing, and delivery pipelines.

## Project Goals

- Build a real full-stack application using TypeScript end to end.
- Model the domain with explicit entities and business rules, avoiding scattered logic across controllers or UI components.
- Separate frontend, BFF, and backend responsibilities to protect authentication details and keep clear HTTP contracts.
- Use PostgreSQL as the source of truth for relational data and historical traceability.
- Include unit, integration, and end-to-end tests as part of the development workflow.
- Prepare the backend for reproducible deployment through a multi-stage Docker build.
- Keep an incremental design: events and sessions first, then analysis, visualizations, and automation.

## Current State

The project currently includes:

- Google login through Firebase Authentication.
- A NestJS backend that validates Firebase Admin tokens and issues first-party sessions.
- `httpOnly` cookies managed from Next.js API routes.
- Authenticated event creation.
- Persistence for users, sessions, events, and tags in PostgreSQL using Prisma.
- Database health check.
- Initial UI with landing page, home, navigation, visual kanban board, and event creation form.
- Unit tests, backend integration tests, backend e2e tests, frontend tests with Vitest, and e2e tests with Playwright.
- GitHub Actions to validate frontend and backend.
- Production-oriented Dockerfile for the backend.

## Tech Stack

### Frontend

- **Next.js 16** with the App Router.
- **React 19** for the UI.
- **TypeScript** as the main language.
- **Tailwind CSS 4** for utility-first styling.
- **React Aria Components** and custom components for accessibility and visual consistency.
- **Firebase Web SDK** for Google sign-in from the client.
- **Vitest** for unit testing frontend logic.
- **Playwright** for end-to-end testing on desktop and mobile.

### Backend

- **NestJS 11** as a modular HTTP framework.
- **TypeScript** for static typing and internal contracts.
- **Prisma 7** as the ORM.
- **PostgreSQL** as the relational database.
- **Firebase Admin SDK** to validate tokens issued by Firebase Authentication.
- **Jest** and **Supertest** for unit, integration, and e2e tests.
- **Docker** with a multi-stage build on Node 22 Alpine.

### DevOps And Quality

- **pnpm** as the package manager.
- **GitHub Actions** for CI.
- **ESLint** and **Prettier** for quality and formatting.
- Separate pipelines for frontend and backend.
- Backend Docker image build inside CI.

## High-Level Architecture

The repository is organized as two independent applications:

```text
Life-Tracker/
  frontend/   # Next.js, BFF routes, UI, and frontend tests
  backend/    # NestJS, domain, use cases, Prisma, and backend tests
```

The architecture follows a separation by layers and responsibilities:

```mermaid
flowchart LR
  User[User] --> Browser[Next.js UI]
  Browser --> Firebase[Firebase Auth]
  Browser --> BFF[Next.js API Routes / BFF]
  BFF --> Backend[NestJS API]
  Backend --> FirebaseAdmin[Firebase Admin]
  Backend --> Postgres[(PostgreSQL)]
```

The UI does not call the backend directly for sensitive authenticated operations. It first goes through Next.js API routes, which act as a BFF. This layer manages `httpOnly` cookies, normalizes payloads, translates errors, and avoids exposing the API session token to browser JavaScript.

## Authentication Flow

1. The user signs in with Google from the frontend using the Firebase Web SDK.
2. Firebase returns an `idToken`.
3. The UI sends that `idToken` to the BFF route `POST /api/auth/google/start`.
4. The BFF calls the NestJS backend at `POST /api/v1/session/google/start`.
5. The backend validates the token with Firebase Admin.
6. If the token is valid, the backend creates or updates the user in PostgreSQL.
7. The backend generates a first-party session token, stores its SHA-256 hash, and returns the token to the BFF.
8. The BFF stores the token in an `httpOnly`, `sameSite=lax` cookie, marked as `secure` in production.
9. Protected operations send that cookie to the backend, where `SessionGuard` validates that the session exists, has not expired, and has not been revoked.

This decision combines the simplicity of Firebase for federated identity with first-party control over sessions, expiration, and persistence.

## Backend: Technical Design

The backend is built around NestJS modules:

- `SessionModule`: login, sessions, users, and authentication guard.
- `EventModule`: event creation, domain rules, repositories, and HTTP controller.
- `HealthModule`: operational database health check.
- `PrismaModule`: Prisma/PostgreSQL connection and lifecycle.
- `FirebaseModule`: Firebase Admin integration.

Inside each module, the structure is inspired by hexagonal architecture:

- **Delivery**: HTTP controllers and DTOs.
- **Application**: use cases, inbound ports, and application errors.
- **Domain**: entities, business rules, and repository ports.
- **Infrastructure**: concrete implementations using Prisma or external services.

Examples of applied decisions:

- Controllers do not contain business logic; they delegate to use cases.
- Event rules live in the `Event` entity, including user validation, required name, and consistency between start and end dates.
- Repositories are consumed through ports, which allows use cases to be tested without depending on Prisma.
- Event and tag creation runs inside a transaction to preserve consistency.
- Sessions are stored as hashes, not as plain tokens.

## Frontend: Technical Design

The frontend uses the Next.js App Router with a pragmatic separation:

- `app/`: routes, layouts, and API routes.
- `components/`: visual components organized into atoms, molecules, organisms, and templates.
- `features/`: frontend business logic by feature, such as `events-api`.
- `lib/`: API clients and Firebase initialization.
- `tests/e2e/`: end-to-end tests with Playwright.

Next.js API routes act as a BFF:

- they receive requests from the browser;
- they read and write secure cookies;
- they validate payloads before forwarding them to the backend;
- they translate technical errors into responses the UI can use;
- they decouple `NEXT_PUBLIC_*` variables from private variables such as `API_URL`.

This layer adds some complexity, but improves security and control over the contract between the browser and the backend.

## Data Model

The current model is centered around five main tables:

- `users`: internal user identity associated with `firebaseUid`.
- `sessions`: first-party backend sessions with `tokenHash`, expiration, and request metadata.
- `events`: events created by authenticated users.
- `tags`: normalized tags.
- `event_tags`: join table for the many-to-many relationship between events and tags.

Main relationships:

- A user has many sessions.
- A user has many events.
- An event can have many tags.
- A tag can be associated with many events.

Choosing PostgreSQL makes it possible to work with relationships, constraints, indexes, and future temporal analytics queries without losing referential integrity.

## Trade-Offs And Considerations

- **Firebase Auth + first-party sessions**: Firebase simplifies identity and social login, while first-party sessions provide control over expiration, revocation, and storage. The cost is maintaining an additional session layer.
- **BFF with Next.js API Routes**: this avoids exposing sensitive tokens to the client and centralizes `httpOnly` cookies. The trade-off is duplicating part of the HTTP contract between frontend and backend.
- **Modular/hexagonal backend architecture**: it may look more structured than necessary for a small app, but it prepares the project to grow without mixing domain, infrastructure, and delivery concerns.
- **Prisma as ORM**: it accelerates development, migrations, and relational mapping. In exchange, some advanced SQL optimizations may require more specific queries in the future.
- **Monorepo without a shared root workspace**: it keeps frontend and backend independent and simple to run. As a future improvement, shared tooling could be unified if common packages appear.
- **Distributed validation**: there is basic validation in the BFF and domain validation in the backend. This improves early feedback and security, although it requires consistency across layers.
- **Docker only for the backend for now**: this prioritizes the service that benefits most from reproducible deployment. The frontend can still be deployed through the standard Next.js flow.

## Testing

The project uses a layered testing strategy:

- **Backend unit tests**: use cases and isolated logic.
- **Backend integration tests**: HTTP controllers with replaced dependencies.
- **Backend e2e tests**: application startup and endpoint verification.
- **Frontend unit tests**: payload normalization and error handling.
- **Frontend e2e tests**: smoke tests for the landing page and initial visible flow with Playwright.

Main commands:

```bash
# Backend
cd backend
pnpm test
pnpm test:integration
pnpm test:e2e

# Frontend
cd frontend
pnpm test
pnpm test:e2e
```

## CI/CD

The repository includes GitHub Actions workflows:

- **Backend CI**: installs dependencies, runs lint, unit tests, integration tests, e2e tests, build, and Docker image build.
- **Frontend CI**: installs dependencies, runs lint, unit tests, installs Playwright browsers, runs e2e tests, and build.

Both pipelines use Node 22 and pnpm 11.3.0 with lockfile-based cache.

## Local Development

### Requirements

- Node.js 22.
- pnpm.
- PostgreSQL accessible through `DATABASE_URL`.
- Firebase project configured for the Web SDK and Admin SDK.

### Backend

```bash
cd backend
pnpm install
pnpm prisma generate
pnpm start:dev
```

Expected variables:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/life_tracker"
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
SESSION_TTL_DAYS="7"
PORT="8080"
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Expected variables:

```bash
API_URL="http://localhost:8080"
NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```

## Docker

The backend includes a multi-stage Dockerfile:

- `deps`: installs dependencies using the lockfile.
- `build`: generates Prisma Client, compiles NestJS, and removes development dependencies.
- `runtime`: runs the app as a non-root user and exposes port `8080`.

Build local:

```bash
cd backend
docker build -t life-tracker-backend .
```

## Roadmap

- Real listing of persisted events in the kanban board.
- Filters by tags, dates, and text.
- Timeline/calendar view.
- Event editing and deletion.
- Session revocation and logout.
- Personal metrics and dashboards.
- Versioned migrations and development seeds.
- Observability with structured logs and metrics.
- Validation hardening with shared schemas or generated contracts.

## Professional Focus

This project aims to show how I make technical decisions beyond "making it work":

- incremental design with room for growth;
- separation between domain, application, and infrastructure;
- authentication designed around security and user experience;
- consistent relational persistence;
- testing at multiple levels;
- quality automation in CI;
- documented trade-offs and next steps.

In short, Life Tracker is a full-stack foundation for capturing personal history and gradually turning it into actionable information, built with modern tools and a focus on maintainability.