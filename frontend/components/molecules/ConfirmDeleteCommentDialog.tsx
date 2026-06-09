"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  getCommentAuthorLabel,
  type EventCommentItem,
} from "@/features/events/event-comments-api";
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";

type ConfirmDeleteCommentDialogProps = {
  comment: EventCommentItem | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteCommentDialog({
  comment,
  isOpen,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteCommentDialogProps) {
  if (!comment) return null;

  const preview =
    comment.body.length > 120 ? `${comment.body.slice(0, 120)}...` : comment.body;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isDeleting}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <Modal className="w-full max-w-md outline-none">
        <Dialog
          role="alertdialog"
          aria-labelledby="delete-comment-title"
          aria-describedby="delete-comment-description"
          className="rounded-2xl border border-earth-300 bg-earth-50 p-6 shadow-xl"
        >
          <Heading
            id="delete-comment-title"
            slot="title"
            className="text-lg font-bold text-earth-900"
          >
            Eliminar comentario
          </Heading>
          <div id="delete-comment-description" className="mt-3 space-y-3 text-sm text-earth-600">
            <p>
              ¿Seguro que quieres eliminar este comentario de{" "}
              <span className="font-semibold text-earth-900">
                {getCommentAuthorLabel(comment)}
              </span>
              ?
            </p>
            <blockquote className="rounded-xl border border-earth-300 bg-earth-100 p-3 text-earth-700">
              {preview}
            </blockquote>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              appearance="outline"
              size="md"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              appearance="fill"
              size="md"
              disabled={isDeleting}
              onClick={onConfirm}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
