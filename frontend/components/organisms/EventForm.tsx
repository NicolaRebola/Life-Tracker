"use client";

import { useEffect, useRef, useState } from "react";
import Loader from "@/components/atoms/Loader/Loader";
import { Button } from "@/components/tailgrids/core/button";
import { Toast } from "@/components/tailgrids/core/toast";
import {
  createEvent,
  updateEvent,
  type EventFormValues,
} from "@/features/events/events-api";

type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

const emptyValues: EventFormValues = {
  fromDateTime: "",
  toDateTime: "",
  name: "",
  description: "",
  notes: "",
  tags: "",
};

type EventFormMode = "create" | "edit";

type EventFormProps = {
  mode?: EventFormMode;
  eventId?: string;
  initialValues?: EventFormValues;
  onSuccess?: () => void;
};

export default function EventForm({
  mode = "create",
  eventId,
  initialValues,
  onSuccess,
}: EventFormProps) {
  const [values, setValues] = useState(initialValues ?? emptyValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  function updateField(field: keyof EventFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "edit") {
        if (!eventId) {
          throw new Error("No se pudo identificar el evento");
        }

        await updateEvent(eventId, values);
        showToast(
          { variant: "success", message: "Evento actualizado!" },
          { closeOnSuccess: true },
        );
      } else {
        await createEvent(values);
        setValues({ ...emptyValues });
        showToast(
          { variant: "success", message: "Evento agregado!" },
          { closeOnSuccess: true },
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : mode === "edit"
            ? "No se pudo actualizar el evento"
            : "No se pudo crear el evento";
      showToast({ variant: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function showToast(toast: ToastState, options?: { closeOnSuccess?: boolean }) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToast(toast);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      if (toast?.variant === "success" && options?.closeOnSuccess) onSuccess?.();
    }, 1500);
  }

  const title = mode === "edit" ? "Editar Evento" : "Nuevo Evento";
  const submitLabel = mode === "edit" ? "Guardar cambios" : "Crear evento";

  return (
    <>
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-50 md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
      <div>
        <p className="m-0 text-lg font-bold text-title-50">{title}</p>
        <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 pt-5">
          <div className="flex h-full flex-1 flex-col gap-4">
            <input
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              placeholder="Nombre"
              onChange={(event) => updateField("name", event.currentTarget.value)}
              type="text"
              value={values.name}
            />
            <input
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              placeholder="Inicio"
              type="datetime-local"
              onChange={(event) => updateField("fromDateTime", event.currentTarget.value)}
              value={values.fromDateTime}
            />
            <input
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              placeholder="Fin"
              type="datetime-local"
              onChange={(event) => updateField("toDateTime", event.currentTarget.value)}
              value={values.toDateTime}
            />

            <textarea
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              placeholder="Descripción"
              onChange={(event) => updateField("description", event.currentTarget.value)}
              value={values.description}
            />
            <textarea
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              placeholder="Notas"
              onChange={(event) => updateField("notes", event.currentTarget.value)}
              value={values.notes}
            />
            <input
              className="w-full rounded-md border border-gray-300 bg-gray-100 text-foreground-100"
              onChange={(event) => updateField("tags", event.currentTarget.value)}
              type="text"
              value={values.tags}
              placeholder="Tag separados por coma (universidad,analisis matematico)"
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader /> : submitLabel}
          </Button>
        </form>
      </div>
    </>
  );
}
