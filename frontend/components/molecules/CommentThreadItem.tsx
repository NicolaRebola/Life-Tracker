"use client";

import { useState } from "react";
import { Avatar } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import {
  formatCommentDate,
  getCommentAuthorInitial,
  getCommentAuthorLabel,
  type EventCommentItem,
} from "@/features/events/event-comments-api";

type CommentThreadItemProps = {
  comment: EventCommentItem;
  isUpdating?: boolean;
  isDeleting?: boolean;
  onUpdate?: (commentId: string, body: string) => Promise<void>;
  onDeleteRequest?: (comment: EventCommentItem) => void;
};

export default function CommentThreadItem({
  comment,
  isUpdating = false,
  isDeleting = false,
  onUpdate,
  onDeleteRequest,
}: CommentThreadItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!onUpdate || draft.trim() === "" || isUpdating) return;

    setError(null);

    try {
      await onUpdate(comment.id, draft);
      setIsEditing(false);
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar el comentario";
      setError(message);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-earth-300/60 bg-earth-100/70 p-3">
      <Avatar
        size="sm"
        fallback={getCommentAuthorInitial(comment)}
        label={{
          title: getCommentAuthorLabel(comment),
          subtitle: formatCommentDate(comment.createdAt),
        }}
      />

      <div className="min-w-0 flex-1 flex flex-col">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.currentTarget.value)}
              rows={3}
              disabled={isUpdating}
              className="w-full resize-none rounded-lg border border-earth-300 bg-earth-50 px-3 py-2 text-sm text-earth-900 outline-none focus:border-primary-400"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void handleSave();
                }}
                disabled={isUpdating || draft.trim() === ""}
              >
                Guardar
              </Button>
              <Button
                type="button"
                size="sm"
                appearance="outline"
                onClick={() => {
                  setDraft(comment.body);
                  setIsEditing(false);
                  setError(null);
                }}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-earth-700">{comment.body}</p>
        )}

        {comment.isOwn && !isEditing && (
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-earth-600 hover:text-earth-900"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest?.(comment)}
              disabled={isDeleting}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </article>
  );
}
