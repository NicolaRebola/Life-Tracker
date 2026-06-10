import { expect, test } from "@playwright/test";
import {
  createMockComment,
  createMockEvent,
  fulfillJson,
  type MockComment,
} from "./helpers/events";

test.describe("shared events", () => {
  test("renders a public shared event with comments", async ({ page }) => {
    const event = createMockEvent({ name: "Evento compartido e2e" });
    const comments = [createMockComment({ body: "Comentario público" })];

    await page.route("**/api/shared/events/evt-1", (route) =>
      fulfillJson(route, { event }),
    );
    await page.route("**/api/shared/events/evt-1/comments", (route) =>
      fulfillJson(route, { items: comments }),
    );

    await page.goto("/shared/events/evt-1");

    await expect(page.getByRole("heading", { name: "Evento compartido e2e" })).toBeVisible();
    await expect(page.getByText("Comentario público")).toBeVisible();
  });

  test("lets a participant comment on a shared event", async ({ page }) => {
    const event = createMockEvent({ name: "Evento con thread público" });
    const comments: MockComment[] = [];
    let createdBody: string | null = null;

    await page.route("**/api/shared/events/evt-1", (route) =>
      fulfillJson(route, { event }),
    );
    await page.route("**/api/shared/events/evt-1/comments", async (route) => {
      if (route.request().method() === "GET") return fulfillJson(route, { items: comments });

      createdBody = (await route.request().postDataJSON()).body;
      const comment = createMockComment({
        id: "shared-comment-created",
        body: createdBody ?? "",
        author: {
          kind: "PARTICIPANT",
          id: "participant-1",
          displayName: "Invitada E2E",
          email: "participant@example.com",
        },
      });
      comments.push(comment);
      return fulfillJson(route, { comment }, 201);
    });

    await page.goto("/shared/events/evt-1");
    await page.getByLabel("Agregar comentario").fill("Comentario público creado");
    await page.getByRole("button", { name: "Comentar" }).click();

    await expect.poll(() => createdBody).toBe("Comentario público creado");
    await expect(page.getByText("Comentario público creado")).toBeVisible();
  });

  test("shows an error when the shared event does not exist", async ({ page }) => {
    await page.route("**/api/shared/events/missing-event", (route) =>
      fulfillJson(route, { message: "No encontrado" }, 404),
    );
    await page.route("**/api/shared/events/missing-event/comments", (route) =>
      fulfillJson(route, { items: [] }),
    );

    await page.goto("/shared/events/missing-event");

    await expect(page.getByText("No se pudo cargar el evento compartido")).toBeVisible();
  });
});
