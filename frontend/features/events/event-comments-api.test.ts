import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEventComment,
  CreateEventCommentError,
  deleteEventComment,
  listEventComments,
} from "./event-comments-api";

describe("listEventComments", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests comments from the BFF route", async () => {
    const responseBody = {
      items: [
        {
          id: "comment-1",
          eventId: "event-1",
          userId: "user-1",
          body: "Comentario",
          createdAt: "2026-06-08T10:00:00.000Z",
          updatedAt: "2026-06-08T10:00:00.000Z",
          isOwn: true,
          author: {
            id: "user-1",
            displayName: "Test User",
            email: "test@example.com",
          },
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(listEventComments("event-1")).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1/comments");
  });
});

describe("createEventComment", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a trimmed body to the BFF route", async () => {
    const responseBody = {
      comment: {
        id: "comment-1",
        eventId: "event-1",
        userId: "user-1",
        body: "Comentario",
        createdAt: "2026-06-08T10:00:00.000Z",
        updatedAt: "2026-06-08T10:00:00.000Z",
        isOwn: true,
        author: {
          id: "user-1",
          displayName: "Test User",
          email: "test@example.com",
        },
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(createEventComment("event-1", "  Comentario  ")).resolves.toEqual(
      responseBody,
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: "Comentario" }),
    });
  });

  it("throws a CreateEventCommentError when the BFF rejects the request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: "El comentario no puede estar vacío",
          fields: ["body"],
        }),
      }),
    );

    await expect(createEventComment("event-1", "   ")).rejects.toMatchObject<CreateEventCommentError>({
      name: "CreateEventCommentError",
      message: "El comentario no puede estar vacío",
      status: 400,
      fields: ["body"],
    });
  });
});

describe("deleteEventComment", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the BFF delete route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteEventComment("event-1", "comment-1")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("/api/events/event-1/comments/comment-1", {
      method: "DELETE",
    });
  });
});
