import { expect, test } from "@playwright/test";
import {
  createMockComment,
  createMockEvent,
  createMockParticipant,
  eventCard,
  eventSheet,
  fulfillJson,
  mockDefaultEventsApp,
  type MockComment,
  type MockParticipant,
} from "./helpers/events";

test.describe("event comments", () => {
  test("creates a comment and updates the thread", async ({ page }) => {
    const event = createMockEvent({ commentCount: 0 });
    const comments: MockComment[] = [];
    let createdBody: string | null = null;

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1/comments", async (route) => {
      if (route.request().method() === "GET") return fulfillJson(route, { items: comments });
      createdBody = (await route.request().postDataJSON()).body;
      const comment = createMockComment({ id: "comment-created", body: createdBody ?? "" });
      comments.push(comment);
      return fulfillJson(route, { comment }, 201);
    });

    await page.goto("/home/events");
    await eventCard(page, event.name).getByLabel("Abrir comentarios (0)").click();

    const sheet = eventSheet(page);
    await expect(sheet).toBeVisible();
    await sheet.getByLabel("Agregar comentario").fill("Comentario creado por e2e");
    await sheet.getByRole("button", { name: "Comentar" }).click();

    await expect.poll(() => createdBody).toBe("Comentario creado por e2e");
    await expect(page.getByText("Comentario creado por e2e")).toBeVisible();
  });

  test("edits and deletes an own comment", async ({ page }) => {
    const event = createMockEvent({ commentCount: 1 });
    const comments = [createMockComment({ body: "Comentario editable" })];
    let updatedBody: string | null = null;
    let deletedCommentId: string | null = null;

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1/comments", (route) =>
      fulfillJson(route, { items: comments }),
    );
    await page.route("**/api/events/evt-1/comments/comment-1", async (route) => {
      if (route.request().method() === "PATCH") {
        updatedBody = (await route.request().postDataJSON()).body;
        comments[0] = { ...comments[0], body: updatedBody ?? comments[0].body };
        return fulfillJson(route, { comment: comments[0] });
      }

      if (route.request().method() === "DELETE") {
        deletedCommentId = "comment-1";
        comments.splice(0, 1);
        return fulfillJson(route, {});
      }

      return route.fallback();
    });

    await page.goto("/home/events");
    await eventCard(page, event.name).getByLabel("Abrir comentarios (1)").click();

    const sheet = eventSheet(page);
    const commentArticle = sheet.locator("article").first();
    await commentArticle.getByRole("button", { name: "Editar" }).click();
    await commentArticle.locator("textarea").fill("Comentario editado por e2e");
    await commentArticle.getByRole("button", { name: "Guardar" }).click();

    await expect.poll(() => updatedBody).toBe("Comentario editado por e2e");
    await expect(page.getByText("Comentario editado por e2e")).toBeVisible();

    await sheet
      .locator("article")
      .filter({ hasText: "Comentario editado por e2e" })
      .getByRole("button", { name: "Eliminar" })
      .click();
    await page
      .getByRole("alertdialog", { name: "Eliminar comentario" })
      .getByRole("button", { name: "Eliminar" })
      .click();

    await expect.poll(() => deletedCommentId).toBe("comment-1");
  });
});

test.describe("event participants", () => {
  test("invites a participant and refreshes the participant list", async ({ page }) => {
    const event = createMockEvent({ participantCount: 0 });
    const participants: MockParticipant[] = [];
    let invitedEmail: string | null = null;

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1/participants", async (route) => {
      if (route.request().method() === "GET") return fulfillJson(route, { items: participants });

      invitedEmail = (await route.request().postDataJSON()).email;
      participants.push(
        createMockParticipant({
          id: "participant-created",
          email: invitedEmail ?? "",
          displayName: null,
          status: "PENDING",
        }),
      );
      return fulfillJson(route, { ok: true }, 201);
    });

    await page.goto("/home/events");
    await eventCard(page, event.name).getByLabel("Abrir participantes (0)").click();

    const sheet = eventSheet(page);
    await sheet.getByPlaceholder("persona@email.com").fill("NewUser@Example.com");
    await sheet.getByRole("button", { name: "Invitar" }).click();

    await expect.poll(() => invitedEmail).toBe("newuser@example.com");
    await expect(page.getByText("newuser@example.com")).toBeVisible();
    await expect(page.getByText("Pendiente")).toBeVisible();
  });

  test("removes an accepted participant", async ({ page }) => {
    const event = createMockEvent({ participantCount: 1 });
    const participant = createMockParticipant();
    let removedParticipantId: string | null = null;

    await mockDefaultEventsApp(page, [event]);
    await page.route("**/api/events/evt-1/participants", (route) =>
      fulfillJson(route, { items: [participant] }),
    );
    await page.route("**/api/events/evt-1/participants/participant-1", async (route) => {
      if (route.request().method() !== "DELETE") return route.fallback();
      removedParticipantId = "participant-1";
      return fulfillJson(route, {});
    });

    await page.goto("/home/events");
    await eventCard(page, event.name).getByLabel("Abrir participantes (1)").click();

    const sheet = eventSheet(page);
    await sheet.getByRole("button", { name: "Quitar" }).click();

    await expect.poll(() => removedParticipantId).toBe("participant-1");
    await expect(page.getByText("Revocado")).toBeVisible();
  });
});

test.describe("event invitations", () => {
  test("accepts an invitation and links to the shared event", async ({ page }) => {
    let displayName: string | null = null;

    await page.route("**/api/event-invitations/token-123/accept", async (route) => {
      displayName = (await route.request().postDataJSON()).displayName;
      return fulfillJson(route, { participant: { eventId: "evt-1" } });
    });

    await page.goto("/event-invitations/token-123");
    await page.getByLabel("Nombre visible (opcional)").fill("Invitada E2E");
    await page.getByRole("button", { name: "Aceptar invitación" }).click();

    await expect.poll(() => displayName).toBe("Invitada E2E");
    await expect(page.getByRole("link", { name: "Ver evento" })).toHaveAttribute(
      "href",
      "/shared/events/evt-1",
    );
  });

  test("shows a recoverable error for an invalid invitation", async ({ page }) => {
    await page.route("**/api/event-invitations/invalid-token/accept", (route) =>
      fulfillJson(route, { message: "Invitación expirada" }, 410),
    );

    await page.goto("/event-invitations/invalid-token");
    await page.getByRole("button", { name: "Aceptar invitación" }).click();

    await expect(page.getByText("Invitación expirada")).toBeVisible();
  });
});
