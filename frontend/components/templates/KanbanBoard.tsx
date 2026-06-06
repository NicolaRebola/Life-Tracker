"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "@/components/atoms/Loader/Loader";
import { KanbanLane } from "@/components/organisms/KanbanLane";
import Filters from "@/components/organisms/Filters";
import { Toast } from "@/components/tailgrids/core/toast";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  type EventStatus,
} from "@/features/events/event-status";
import {
  listEvents,
  updateEventStatus,
  type EventListItem,
  type ListEventsFilters,
} from "@/features/events/events-api";
import type { PageSize } from "@/components/molecules/Paginator";

type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

type KanbanBoardProps = {
  refreshKey?: number;
};

const defaultFilters: Required<Pick<ListEventsFilters, "name" | "status" | "tags">> & {
  page: number;
  limit: PageSize;
} = {
  name: "",
  status: "",
  tags: "",
  page: 1,
  limit: 10,
};

export default function KanbanBoard({ refreshKey = 0 }: KanbanBoardProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [mobileLane, setMobileLane] = useState<EventStatus>("TODO");
  const [items, setItems] = useState<EventListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchEvents() {
      setIsLoading(true);
      try {
        const response = await listEvents({
          name: filters.name,
          status: filters.status,
          tags: filters.tags,
          page: filters.page,
          limit: filters.limit,
        });

        if (isCancelled) return;

        setItems(response.items);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      } catch (error) {
        if (isCancelled) return;

        const message =
          error instanceof Error ? error.message : "No se pudieron cargar los eventos";
        setToast({ variant: "error", message });
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchEvents();

    return () => {
      isCancelled = true;
    };
  }, [filters, refreshKey, reloadNonce]);

  const eventsByStatus = useMemo(() => {
    return EVENT_STATUSES.reduce<Record<EventStatus, EventListItem[]>>(
      (acc, status) => {
        acc[status] = items.filter((event) => event.status === status);
        return acc;
      },
      { TODO: [], IN_PROGRESS: [], DONE: [] },
    );
  }, [items]);

  async function handleStatusChange(eventId: string, status: EventStatus) {
    const current = items.find((event) => event.id === eventId);
    if (!current || current.status === status) return;

    const previousItems = items;
    setIsUpdating(true);
    setItems((currentItems) =>
      currentItems.map((event) =>
        event.id === eventId ? { ...event, status } : event,
      ),
    );

    try {
      await updateEventStatus(eventId, status);
      setToast({ variant: "success", message: "Estado actualizado" });
      setReloadNonce((value) => value + 1);
    } catch (error) {
      setItems(previousItems);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del evento";
      setToast({ variant: "error", message });
    } finally {
      setIsUpdating(false);
      setDraggedEventId(null);
    }
  }

  async function handleDrop(targetStatus: EventStatus) {
    if (!draggedEventId) return;
    await handleStatusChange(draggedEventId, targetStatus);
  }

  function updateFilter<K extends keyof typeof defaultFilters>(
    key: K,
    value: (typeof defaultFilters)[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  }

  const handleFilterError = useCallback((message: string) => {
    setToast({ variant: "error", message });
  }, []);

  return (
    <div className="mt-5 flex min-h-0 flex-1 flex-col gap-4">
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-50 md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      <Filters
        name={filters.name}
        status={filters.status}
        tags={filters.tags}
        page={filters.page}
        limit={filters.limit}
        total={total}
        totalPages={totalPages}
        isDisabled={isLoading || isUpdating}
        onNameChange={(name) => updateFilter("name", name)}
        onStatusChange={(status) => updateFilter("status", status)}
        onTagsChange={(tags) => updateFilter("tags", tags)}
        onPageChange={(page) => updateFilter("page", page)}
        onLimitChange={(limit) => updateFilter("limit", limit)}
        onError={handleFilterError}
      />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
            <select
              value={mobileLane}
              onChange={(event) =>
                setMobileLane(event.currentTarget.value as EventStatus)
              }
              className="h-12 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-100 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-gray-400 focus:bg-white"
            >
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {EVENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <KanbanLane
              status={mobileLane}
              events={eventsByStatus[mobileLane]}
              onStatusChange={handleStatusChange}
            />
          </div>

          <div className="hidden min-h-0 flex-1 gap-4 md:grid md:grid-cols-3">
            {EVENT_STATUSES.map((status) => (
              <KanbanLane
                key={status}
                status={status}
                events={eventsByStatus[status]}
                enableDragAndDrop
                draggedEventId={draggedEventId}
                onDragStart={setDraggedEventId}
                onDragEnd={() => setDraggedEventId(null)}
                onDrop={handleDrop}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
