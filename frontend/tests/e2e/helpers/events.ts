import type { Locator, Page, Route } from "@playwright/test";

export type MockEventStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type MockEvent = {
  id: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: string;
  toDateTime: string;
  status: MockEventStatus;
  tags: Array<{ name: string; label: string }>;
  commentCount: number;
  participantCount: number;
  creator: {
    id: string;
    displayName: string | null;
    email: string;
  };
  isCreator: boolean;
};

export type MockComment = {
  id: string;
  eventId: string;
  userId: string | null;
  participantId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  isOwn: boolean;
  author: {
    kind: "USER" | "PARTICIPANT";
    id: string;
    displayName: string | null;
    email: string;
  };
};

export type MockParticipant = {
  id: string;
  email: string;
  displayName: string | null;
  status: "ACCEPTED" | "PENDING" | "EXPIRED" | "REVOKED";
  invitedAt?: string;
  joinedAt?: string;
  expiresAt?: string;
  deliveryFailedAt?: string;
  lastDeliveryError?: string | null;
};

export const mockSession = {
  authenticated: true,
  user: { id: "user-1", displayName: "Test User", email: "test@example.com" },
  session: { id: "session-1" },
};

export const emptyEventsResponse = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

export function createMockEvent(overrides: Partial<MockEvent> = {}): MockEvent {
  return {
    id: "evt-1",
    name: "Evento de prueba",
    description: "Descripción del evento",
    notes: "Notas del evento",
    fromDateTime: new Date("2026-06-10T12:00:00.000Z").toISOString(),
    toDateTime: new Date("2026-06-10T13:00:00.000Z").toISOString(),
    status: "TODO",
    tags: [{ name: "trabajo", label: "Trabajo" }],
    commentCount: 0,
    participantCount: 0,
    creator: { id: "user-1", displayName: "Test User", email: "test@example.com" },
    isCreator: true,
    ...overrides,
  };
}

export function createMockComment(
  overrides: Partial<MockComment> = {},
): MockComment {
  return {
    id: "comment-1",
    eventId: "evt-1",
    userId: "user-1",
    participantId: null,
    body: "Comentario inicial",
    createdAt: new Date("2026-06-10T12:10:00.000Z").toISOString(),
    updatedAt: new Date("2026-06-10T12:10:00.000Z").toISOString(),
    isOwn: true,
    author: {
      kind: "USER",
      id: "user-1",
      displayName: "Test User",
      email: "test@example.com",
    },
    ...overrides,
  };
}

export function createMockParticipant(
  overrides: Partial<MockParticipant> = {},
): MockParticipant {
  return {
    id: "participant-1",
    email: "participant@example.com",
    displayName: "Participant User",
    status: "ACCEPTED",
    invitedAt: new Date("2026-06-10T12:00:00.000Z").toISOString(),
    joinedAt: new Date("2026-06-10T12:05:00.000Z").toISOString(),
    lastDeliveryError: null,
    ...overrides,
  };
}

export function listEventsResponse(events: MockEvent[], limit = 10) {
  return {
    items: events,
    pagination: {
      page: 1,
      limit,
      total: events.length,
      totalPages: events.length > 0 ? 1 : 0,
    },
  };
}

export async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function mockAuthenticatedSession(page: Page) {
  await page.route("**/api/auth/session", (route) =>
    fulfillJson(route, mockSession),
  );
}

export async function mockEventTags(page: Page) {
  await page.route("**/api/events/tags*", (route) =>
    fulfillJson(route, { items: [{ name: "trabajo", label: "Trabajo" }] }),
  );
}

export async function mockEventsList(page: Page, events: MockEvent[]) {
  await page.route("**/api/events?*", (route) => {
    const url = new URL(route.request().url());
    const limit = Number(url.searchParams.get("limit") ?? "10");
    return fulfillJson(route, listEventsResponse(events, limit));
  });
}

export async function mockDefaultEventsApp(page: Page, events: MockEvent[] = []) {
  await mockAuthenticatedSession(page);
  await mockEventTags(page);
  await mockEventsList(page, events);
}

export function eventCard(page: Page, eventName: string): Locator {
  return page
    .getByRole("heading", { name: eventName, level: 3 })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .filter({ visible: true });
}

export function eventSheet(page: Page): Locator {
  return page.getByRole("dialog");
}
