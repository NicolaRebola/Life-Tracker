"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Loader from "@/components/atoms/Loader/Loader";
import ConfirmDeleteEventDialog from "@/components/molecules/ConfirmDeleteEventDialog";
import CalendarDayEventsSheet from "@/components/organisms/CalendarDayEventsSheet";
import CalendarMonthGrid from "@/components/organisms/CalendarMonthGrid";
import CalendarToolbar from "@/components/molecules/CalendarToolbar";
import EventCommentsSheet from "@/components/organisms/EventCommentsSheet";
import EventParticipantsSheet from "@/components/organisms/EventParticipantsSheet";
import { Toast } from "@/components/tailgrids/core/toast";
import {
  addMonths,
  buildMonthGrid,
  getVisibleRangeForMonth,
  getWeekdayLabels,
  groupEventsByDay,
} from "@/features/events/event-calendar";
import {
  deleteEvent,
  listEvents,
  type EventListItem,
} from "@/features/events/events-api";

type ToastState = {
  variant: "success" | "error";
  message: string;
} | null;

type EventCalendarMonthProps = {
  refreshKey?: number;
  onEditEvent?: (event: EventListItem) => void;
  onEventDeleted?: (eventId: string) => void;
};

export default function EventCalendarMonth({
  refreshKey = 0,
  onEditEvent,
  onEventDeleted,
}: EventCalendarMonthProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches,
  );
  const [items, setItems] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<EventListItem | null>(null);
  const [commentingEvent, setCommentingEvent] = useState<EventListItem | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [participantsEvent, setParticipantsEvent] = useState<EventListItem | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(), []);
  const eventsByDay = useMemo(() => groupEventsByDay(items, weeks), [items, weeks]);

  const selectedDayEvents = selectedDayKey ? eventsByDay[selectedDayKey] ?? [] : [];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (query: MediaQueryListEvent) => {
      setIsDesktop(query.matches);
      if (query.matches) setIsDaySheetOpen(false);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function handleSelectDay(dayKey: string) {
    setSelectedDayKey(dayKey);
    if (!isDesktop) setIsDaySheetOpen(true);
  }

  useEffect(() => {
    let isCancelled = false;

    async function fetchEvents() {
      setIsLoading(true);
      try {
        const range = getVisibleRangeForMonth(year, month);
        const response = await listEvents({
          fromDateTime: range.start.toISOString(),
          toDateTime: range.end.toISOString(),
          page: 1,
          limit: 500,
        });

        if (isCancelled) return;

        setItems(response.items);
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
  }, [year, month, refreshKey]);

  const handleCommentCountChange = useCallback((eventId: string, commentCount: number) => {
    setItems((currentItems) =>
      currentItems.map((event) =>
        event.id === eventId && event.commentCount !== commentCount
          ? { ...event, commentCount }
          : event,
      ),
    );
    setCommentingEvent((currentEvent) =>
      currentEvent?.id === eventId && currentEvent.commentCount !== commentCount
        ? { ...currentEvent, commentCount }
        : currentEvent,
    );
  }, []);

  const handleParticipantCountChange = useCallback((eventId: string, participantCount: number) => {
    setItems((currentItems) =>
      currentItems.map((event) =>
        event.id === eventId && event.participantCount !== participantCount
          ? { ...event, participantCount }
          : event,
      ),
    );
    setParticipantsEvent((currentEvent) =>
      currentEvent?.id === eventId && currentEvent.participantCount !== participantCount
        ? { ...currentEvent, participantCount }
        : currentEvent,
    );
  }, []);

  async function handleConfirmDelete() {
    if (!pendingDeleteEvent) return;

    const eventId = pendingDeleteEvent.id;
    const previousItems = items;

    setIsDeleting(true);
    setItems((currentItems) => currentItems.filter((event) => event.id !== eventId));

    try {
      await deleteEvent(eventId);
      setToast({ variant: "success", message: "Evento eliminado" });
      setPendingDeleteEvent(null);
      onEventDeleted?.(eventId);
    } catch (error) {
      setItems(previousItems);
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el evento";
      setToast({ variant: "error", message });
    } finally {
      setIsDeleting(false);
    }
  }

  function handlePreviousMonth() {
    setVisibleMonth((current) => addMonths(current, -1));
    setSelectedDayKey(null);
  }

  function handleNextMonth() {
    setVisibleMonth((current) => addMonths(current, 1));
    setSelectedDayKey(null);
  }

  function handleToday() {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDayKey(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {toast && (
        <div className="fixed left-4 right-4 top-4 z-50 md:left-auto md:right-6 md:top-6">
          <Toast
            variant={toast.variant}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      <div className="shrink-0">
        <CalendarToolbar
          visibleMonth={visibleMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div className="min-h-0 md:contents md:flex-1">
          <CalendarMonthGrid
            weeks={weeks}
            weekdayLabels={weekdayLabels}
            eventsByDay={eventsByDay}
            selectedDayKey={selectedDayKey}
            onSelectDay={handleSelectDay}
            onEditEvent={onEditEvent}
          />
        </div>
      )}

      <CalendarDayEventsSheet
        selectedDayKey={selectedDayKey}
        isOpen={isDaySheetOpen}
        events={selectedDayEvents}
        onOpenChange={(open) => {
          setIsDaySheetOpen(open);
          if (!open) setSelectedDayKey(null);
        }}
        onEditEvent={onEditEvent}
        onAddComment={(event) => {
          setIsDaySheetOpen(false);
          setCommentingEvent(event);
          setIsCommentsOpen(true);
        }}
        onManageParticipants={(event) => {
          setIsDaySheetOpen(false);
          setParticipantsEvent(event);
          setIsParticipantsOpen(true);
        }}
        onDeleteEvent={(event) => {
          setIsDaySheetOpen(false);
          setPendingDeleteEvent(event);
        }}
      />

      <ConfirmDeleteEventDialog
        event={pendingDeleteEvent}
        isOpen={pendingDeleteEvent !== null}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setPendingDeleteEvent(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />

      <EventCommentsSheet
        event={commentingEvent}
        isOpen={isCommentsOpen}
        onOpenChange={(open) => {
          setIsCommentsOpen(open);
          if (!open) {
            setCommentingEvent(null);
          }
        }}
        onCommentCountChange={handleCommentCountChange}
      />

      <EventParticipantsSheet
        event={participantsEvent}
        isOpen={isParticipantsOpen}
        onOpenChange={(open) => {
          setIsParticipantsOpen(open);
          if (!open) {
            setParticipantsEvent(null);
          }
        }}
        onParticipantCountChange={handleParticipantCountChange}
      />
    </div>
  );
}
