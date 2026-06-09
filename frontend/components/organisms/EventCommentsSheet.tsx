"use client";

import { useEffect, useState } from "react";
import CommentComposer from "@/components/molecules/CommentComposer";
import ConfirmDeleteCommentDialog from "@/components/molecules/ConfirmDeleteCommentDialog";
import CommentThread from "@/components/organisms/CommentThread";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
} from "@/components/tailgrids/core/sheet";
import { Toast } from "@/components/tailgrids/core/toast";
import {
  createEventComment,
  deleteEventComment,
  listEventComments,
  updateEventComment,
  type EventCommentItem,
} from "@/features/events/event-comments-api";
import type { EventListItem } from "@/features/events/events-api";

type EventCommentsSheetProps = {
  event: EventListItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCommentCountChange?: (eventId: string, commentCount: number) => void;
};

type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

export default function EventCommentsSheet({
  event,
  isOpen,
  onOpenChange,
  onCommentCountChange,
}: EventCommentsSheetProps) {
  const [comments, setComments] = useState<EventCommentItem[]>([]);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [deleteDialogComment, setDeleteDialogComment] =
    useState<EventCommentItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const eventId = event?.id;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (query: MediaQueryListEvent) => {
      setIsDesktop(query.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isOpen || !eventId) {
      return;
    }

    const currentEventId = eventId;
    let isCancelled = false;

    async function fetchComments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await listEventComments(currentEventId);
        if (isCancelled) return;

        setComments(response.items);
        onCommentCountChange?.(currentEventId, response.items.length);
      } catch (fetchError) {
        if (isCancelled) return;

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "No se pudieron cargar los comentarios";
        setError(message);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchComments();

    return () => {
      isCancelled = true;
    };
  }, [eventId, isOpen, onCommentCountChange]);

  async function handleCreateComment(body: string) {
    if (!event) return;

    setIsSubmitting(true);

    try {
      const response = await createEventComment(event.id, body);
      const nextComments = [...comments, response.comment];
      setComments(nextComments);
      onCommentCountChange?.(event.id, nextComments.length);
      setToast({ variant: "success", message: "Comentario agregado" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateComment(commentId: string, body: string) {
    if (!event) return;

    setUpdatingCommentId(commentId);

    try {
      const response = await updateEventComment(event.id, commentId, body);
      const nextComments = comments.map((comment) =>
        comment.id === commentId ? response.comment : comment,
      );
      setComments(nextComments);
      setToast({ variant: "success", message: "Comentario editado" });
    } finally {
      setUpdatingCommentId(null);
    }
  }

  function handleDeleteCommentRequest(comment: EventCommentItem) {
    setDeleteDialogComment(comment);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (open || deletingCommentId !== null) return;

    setIsDeleteDialogOpen(false);
    window.setTimeout(() => {
      setDeleteDialogComment(null);
    }, 150);
  }

  async function handleConfirmDeleteComment() {
    if (!event) return;
    if (!deleteDialogComment) return;

    const commentId = deleteDialogComment.id;

    setDeletingCommentId(commentId);
    setError(null);

    try {
      await deleteEventComment(event.id, commentId);
      const nextComments = comments.filter((comment) => comment.id !== commentId);

      setIsDeleteDialogOpen(false);

      window.setTimeout(() => {
        setComments(nextComments);
        onCommentCountChange?.(event.id, nextComments.length);
        setDeleteDialogComment(null);
        setDeletingCommentId(null);
      }, 150);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el comentario";
      setError(message);
      setDeletingCommentId(null);
    }
  }

  if (!event) {
    return null;
  }

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-[70] md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
      <Sheet isOpen={isOpen} onOpenChange={onOpenChange}>
        <SheetOverlay>
          <SheetContent
            side={isDesktop ? "right" : "bottom"}
            className={isDesktop ? "h-full max-w-md" : "max-h-[85vh]"}
          >
            <SheetHeader>
              <SheetTitle>Comentarios</SheetTitle>
              <SheetDescription>{event.name}</SheetDescription>
            </SheetHeader>
            <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CommentThread
                  comments={comments}
                  isLoading={isLoading}
                  updatingCommentId={updatingCommentId}
                  deletingCommentId={deletingCommentId}
                  onUpdateComment={handleUpdateComment}
                  onDeleteCommentRequest={handleDeleteCommentRequest}
                />
              </div>
              <CommentComposer
                isSubmitting={isSubmitting}
                onSubmit={handleCreateComment}
              />
            </SheetBody>
          </SheetContent>
        </SheetOverlay>
      </Sheet>
      <ConfirmDeleteCommentDialog
        comment={deleteDialogComment}
        isOpen={isDeleteDialogOpen}
        isDeleting={deletingCommentId !== null}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={() => {
          void handleConfirmDeleteComment();
        }}
      />
    </>
  );
}
