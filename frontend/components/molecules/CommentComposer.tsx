"use client";

import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";

type CommentComposerProps = {
  isSubmitting?: boolean;
  onSubmit: (body: string) => Promise<void>;
};

export default function CommentComposer({
  isSubmitting = false,
  onSubmit,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmedBody = body.trim();
    if (!trimmedBody || isSubmitting) return;

    setError(null);

    try {
      await onSubmit(trimmedBody);
      setBody("");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "No se pudo enviar el comentario";
      setError(message);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="space-y-3 border-t border-earth-300 pt-4">
      <label htmlFor="event-comment-composer" className="text-sm font-semibold text-earth-900">
        Agregar comentario
      </label>
      <textarea
        id="event-comment-composer"
        value={body}
        onChange={(event) => setBody(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="Escribe un comentario..."
        disabled={isSubmitting}
        className="w-full resize-none rounded-xl border border-earth-300 bg-earth-50 mt-2 px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-primary-400 disabled:cursor-not-allowed disabled:bg-earth-100"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-earth-500">Ctrl + Enter para enviar</p>
        <Button
          type="button"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting || body.trim() === ""}
        >
          {isSubmitting ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </div>
  );
}
