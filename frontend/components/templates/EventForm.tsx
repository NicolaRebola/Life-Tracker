"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "../tailgrids/core/button"
import Loader from "../atoms/Loader/Loader"
import { Toast } from "../tailgrids/core/toast"
import { createEvent, EventFormValues } from "@/features/events/events-api"

type ToastState = {
  variant: 'success' | 'error';
  message: string
} | null;

const initialValues: EventFormValues = {
  fromDateTime: '',
  toDateTime: '',
  name: '',
  description: '',
  notes: '',
  tags: '',
}

type EventFormProps = {
  onSuccess?: () => void;
}

export default function EventForm({ onSuccess }: EventFormProps) {
  const [values, setValues] = useState({...initialValues});
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
      [field]: value
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createEvent(values);
      setValues({...initialValues});
      showToast({variant: 'success', message: 'Evento agregado!'}, { closeOnSuccess: true })
    } catch(err: any) {
      showToast({variant: 'error', message: err.message ?? 'No se pudo crear el evento'});
    } finally {
      setIsSubmitting(false);
    }
  }

  function showToast(toast: ToastState, options?: { closeOnSuccess?: boolean }) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToast(toast);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      if (toast?.variant === 'success' && options?.closeOnSuccess) onSuccess?.();
    }, 1500);
  }

  return (
    <>
      {
        toast && (
        <div className="fixed left-4 right-4 top-4 z-50 md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}
      <div>
        <p className="text-lg font-bold text-title-50 m-0">Nuevo Evento</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-5 h-full">
          <div className="flex flex-col flex-1 h-full gap-4">
            <input className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" placeholder="Nombre" onChange={(event) => updateField('name', event.currentTarget.value)} type="text" value={values.name} />
            <input className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" placeholder="Inicio" type="datetime-local" onChange={(event) => updateField('fromDateTime', event.currentTarget.value)} value={values.fromDateTime} />
            <input className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" placeholder="Fin" type="datetime-local" onChange={(event) => updateField('toDateTime', event.currentTarget.value)} value={values.toDateTime} />

            <textarea className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" placeholder="Descripción" onChange={(event) => updateField('description', event.currentTarget.value)} value={values.description}></textarea>
            <textarea className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" placeholder="Notas" onChange={(event) => updateField('notes', event.currentTarget.value)} value={values.notes}></textarea>
            <input className="w-full bg-gray-100 border border-gray-300 text-foreground-100 rounded-md" onChange={(event) => updateField('tags', event.currentTarget.value)} type="text" value={values.tags} placeholder="Tag separados por coma (universidad,analisis matematico)"/>
          </div>

          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (<Loader></Loader>) : 'Crear evento'}</Button>
        </form>
      </div>
    </>
  )

}