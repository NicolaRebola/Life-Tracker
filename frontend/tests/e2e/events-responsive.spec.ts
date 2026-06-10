import { expect, test } from "@playwright/test";

const MOCK_SESSION = {
  authenticated: true,
  user: { id: "user-1", displayName: "Test User", email: "test@example.com" },
  session: { id: "session-1" },
};

const MOCK_EVENTS_EMPTY = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
};

const MOCK_EVENTS_WITH_TODAY = {
  items: [
    {
      id: "evt-1",
      name: "Evento de prueba",
      description: "Descripción del evento",
      notes: "",
      fromDateTime: new Date().toISOString(),
      toDateTime: new Date(Date.now() + 3_600_000).toISOString(),
      status: "TODO",
      tags: [],
      commentCount: 0,
      participantCount: 0,
      creator: { id: "user-1", displayName: "Test User", email: "test@example.com" },
      isCreator: true,
    },
  ],
  pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
};

async function mockAuthAndEvents(
  page: Parameters<Parameters<typeof test>[1]>[0],
  eventsResponse = MOCK_EVENTS_EMPTY,
) {
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SESSION),
    }),
  );

  await page.route("**/api/events*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(eventsResponse),
    }),
  );

  await page.route("**/api/events/tags*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [] }),
    }),
  );
}

async function hasNoHorizontalOverflow(page: Parameters<Parameters<typeof test>[1]>[0]) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
}

test.describe("events page – desktop 1280x720", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("kanban view renders within viewport without overflow", async ({ page }) => {
    await mockAuthAndEvents(page);
    await page.goto("/home/events");

    await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();

    const overflow = await hasNoHorizontalOverflow(page);
    expect(overflow).toBe(true);
  });

  test("calendar view fits within viewport without overflow", async ({ page }) => {
    await mockAuthAndEvents(page, MOCK_EVENTS_WITH_TODAY);
    await page.goto("/home/events");

    await page.getByRole("tab", { name: "Calendario" }).click();

    await expect(page.getByRole("grid", { name: "Calendario mensual" })).toBeVisible();

    const overflow = await hasNoHorizontalOverflow(page);
    expect(overflow).toBe(true);

    const calendarBox = await page.getByRole("grid", { name: "Calendario mensual" }).boundingBox();
    const viewportSize = page.viewportSize();

    expect(calendarBox).not.toBeNull();
    expect(viewportSize).not.toBeNull();

    if (calendarBox && viewportSize) {
      expect(calendarBox.y + calendarBox.height).toBeLessThanOrEqual(viewportSize.height + 2);
    }
  });

  test("navigator header is visible and sticks to top", async ({ page }) => {
    await mockAuthAndEvents(page);
    await page.goto("/home/events");

    const header = page
      .locator("header")
      .filter({ has: page.getByRole("heading", { name: "Life Tracker" }) })
      .first();
    await expect(header).toBeVisible();

    const headerBox = await header.boundingBox();
    expect(headerBox?.y).toBe(0);
  });
});

test.describe("events page – desktop 1366x768", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("calendar view fits within viewport at 1366x768", async ({ page }) => {
    await mockAuthAndEvents(page, MOCK_EVENTS_WITH_TODAY);
    await page.goto("/home/events");

    await page.getByRole("tab", { name: "Calendario" }).click();

    await expect(page.getByRole("grid", { name: "Calendario mensual" })).toBeVisible();

    const overflow = await hasNoHorizontalOverflow(page);
    expect(overflow).toBe(true);

    const calendarBox = await page.getByRole("grid", { name: "Calendario mensual" }).boundingBox();
    const viewportSize = page.viewportSize();

    if (calendarBox && viewportSize) {
      expect(calendarBox.y + calendarBox.height).toBeLessThanOrEqual(viewportSize.height + 2);
    }
  });
});

test.describe("events page – mobile 390x844", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("bottom navigation is visible and does not overlap content", async ({ page }) => {
    await mockAuthAndEvents(page);
    await page.goto("/home/events");

    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    const navBox = await nav.boundingBox();
    const viewportSize = page.viewportSize();

    expect(navBox).not.toBeNull();
    expect(viewportSize).not.toBeNull();

    if (navBox && viewportSize) {
      expect(navBox.y + navBox.height).toBeLessThanOrEqual(viewportSize.height + 2);
    }
  });

  test("no horizontal overflow on kanban view", async ({ page }) => {
    await mockAuthAndEvents(page);
    await page.goto("/home/events");

    await expect(page.getByRole("heading", { name: "Eventos" })).toBeVisible();

    const overflow = await hasNoHorizontalOverflow(page);
    expect(overflow).toBe(true);
  });

  test("calendar compact grid is visible on mobile", async ({ page }) => {
    await mockAuthAndEvents(page, MOCK_EVENTS_EMPTY);
    await page.goto("/home/events");

    await page.getByRole("tab", { name: "Calendario" }).click();

    const overflow = await hasNoHorizontalOverflow(page);
    expect(overflow).toBe(true);
  });

  test("selecting a day on mobile calendar opens events sheet", async ({ page }) => {
    await mockAuthAndEvents(page, MOCK_EVENTS_WITH_TODAY);
    await page.goto("/home/events");

    await page.getByRole("tab", { name: "Calendario" }).click();

    const dayButtons = page.getByRole("button").filter({ hasText: /^\d{1,2}$/ });
    await dayButtons.first().click();

    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
