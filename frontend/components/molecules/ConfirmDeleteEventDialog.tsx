"use client";

import { Button } from "@/components/tailgrids/core/button";
import type { EventListItem } from "@/features/events/events-api";
import {
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";

type ConfirmDeleteEventDialogProps = {
  event: EventListItem | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteEventDialog({
  event,
  isOpen,
  isDeleting = false,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteEventDialogProps) {
  if (!event) return null;

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!isDeleting}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <Modal className="w-full max-w-md outline-none">
        <Dialog
          role="alertdialog"
          aria-labelledby="delete-event-title"
          aria-describedby="delete-event-description"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
        >
          <Heading
            id="delete-event-title"
            slot="title"
            className="text-lg font-bold text-gray-900"
          >
            Eliminar evento
          </Heading>
          <p id="delete-event-description" className="mt-3 text-sm text-gray-600">
            ¿Seguro que quieres eliminar{" "}
            <span className="font-semibold text-gray-900">{event.name}</span>? El
            evento se ocultará y se eliminará definitivamente después de 30 días.
          </p>
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
