import type { EventListItem } from './events-api';
import type { EventStatus } from './event-status';

export type CalendarDay = {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  key: string;
};

export type CalendarWeek = {
  days: CalendarDay[];
};

export type CalendarVisibleRange = {
  start: Date;
  end: Date;
};

export type CalendarEventSegment = {
  event: EventListItem;
  weekIndex: number;
  startColumn: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
};

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  TODO: 'bg-blue-100 text-blue-800 border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  DONE: 'bg-green-100 text-green-800 border-green-200',
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekdayLabels(): string[] {
  return [...WEEKDAY_LABELS];
}

export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatCompactEventTime(fromDateTime: string, toDateTime: string): string {
  const from = new Date(fromDateTime);
  const to = new Date(toDateTime);
  const timeFormatter = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isSameDay(from, to)) {
    return `${timeFormatter.format(from)} - ${timeFormatter.format(to)}`;
  }

  return `${timeFormatter.format(from)} → ${timeFormatter.format(to)}`;
}

export function buildMonthGrid(year: number, month: number): CalendarWeek[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const today = startOfDay(new Date());

  const mondayBasedOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = addDays(firstOfMonth, -mondayBasedOffset);

  const weeks: CalendarWeek[] = [];
  let cursor = gridStart;

  while (cursor <= lastOfMonth || weeks.length < 6) {
    const days: CalendarDay[] = [];

    for (let column = 0; column < 7; column += 1) {
      const date = startOfDay(cursor);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: isSameDay(date, today),
        key: toDayKey(date),
      });
      cursor = addDays(cursor, 1);
    }

    weeks.push({ days });

    if (cursor > lastOfMonth && weeks.length >= 4) {
      break;
    }
  }

  return weeks;
}

export function getVisibleRangeFromGrid(weeks: CalendarWeek[]): CalendarVisibleRange {
  const firstDay = weeks[0]?.days[0]?.date;
  const lastWeek = weeks[weeks.length - 1];
  const lastDay = lastWeek?.days[lastWeek.days.length - 1]?.date;

  if (!firstDay || !lastDay) {
    const now = new Date();
    return {
      start: startOfDay(now),
      end: endOfDay(now),
    };
  }

  return {
    start: startOfDay(firstDay),
    end: endOfDay(lastDay),
  };
}

export function getVisibleRangeForMonth(year: number, month: number): CalendarVisibleRange {
  const weeks = buildMonthGrid(year, month);
  return getVisibleRangeFromGrid(weeks);
}

export function groupEventsByDay(
  events: EventListItem[],
  weeks: CalendarWeek[],
): Record<string, EventListItem[]> {
  const range = getVisibleRangeFromGrid(weeks);
  const grouped: Record<string, EventListItem[]> = {};

  for (const week of weeks) {
    for (const day of week.days) {
      grouped[day.key] = [];
    }
  }

  for (const event of events) {
    const eventStart = new Date(event.fromDateTime);
    const eventEnd = new Date(event.toDateTime);

    if (eventEnd < range.start || eventStart > range.end) {
      continue;
    }

    for (const week of weeks) {
      for (const day of week.days) {
        const dayStart = startOfDay(day.date);
        const dayEnd = endOfDay(day.date);

        if (eventStart <= dayEnd && eventEnd >= dayStart) {
          grouped[day.key].push(event);
        }
      }
    }
  }

  for (const key of Object.keys(grouped)) {
    grouped[key].sort(
      (a, b) =>
        new Date(a.fromDateTime).getTime() - new Date(b.fromDateTime).getTime(),
    );
  }

  return grouped;
}

function dayOverlapsEvent(day: Date, eventStart: Date, eventEnd: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  return eventStart <= dayEnd && eventEnd >= dayStart;
}

export function buildEventSegments(
  events: EventListItem[],
  weeks: CalendarWeek[],
): CalendarEventSegment[] {
  const segments: CalendarEventSegment[] = [];

  for (const event of events) {
    const eventStart = new Date(event.fromDateTime);
    const eventEnd = new Date(event.toDateTime);

    weeks.forEach((week, weekIndex) => {
      let segmentStart = -1;

      week.days.forEach((day, column) => {
        const overlaps = dayOverlapsEvent(day.date, eventStart, eventEnd);

        if (overlaps && segmentStart === -1) {
          segmentStart = column;
        }

        const isSegmentEnd = overlaps && (
          column === week.days.length - 1 ||
          !dayOverlapsEvent(week.days[column + 1].date, eventStart, eventEnd)
        );

        if (segmentStart !== -1 && isSegmentEnd) {
          const previousDay = segmentStart > 0 ? week.days[segmentStart - 1].date : null;
          const nextDay = column < week.days.length - 1 ? week.days[column + 1].date : null;

          segments.push({
            event,
            weekIndex,
            startColumn: segmentStart,
            span: column - segmentStart + 1,
            isStart:
              !previousDay ||
              !dayOverlapsEvent(previousDay, eventStart, eventEnd),
            isEnd:
              !nextDay ||
              !dayOverlapsEvent(nextDay, eventStart, eventEnd),
          });

          segmentStart = -1;
        }
      });
    });
  }

  return segments;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
