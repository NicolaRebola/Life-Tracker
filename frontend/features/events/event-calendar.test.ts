import { describe, expect, it } from 'vitest';
import {
  buildEventSegments,
  buildMonthGrid,
  getVisibleRangeForMonth,
  groupEventsByDay,
} from './event-calendar';
import type { EventListItem } from './events-api';

function createEvent(
  id: string,
  fromDateTime: string,
  toDateTime: string,
): EventListItem {
  return {
    id,
    name: `Evento ${id}`,
    description: '',
    notes: '',
    fromDateTime,
    toDateTime,
    status: 'TODO',
    tags: [],
    commentCount: 0,
  };
}

describe('buildMonthGrid', () => {
  it('builds a grid that includes adjacent month days', () => {
    const weeks = buildMonthGrid(2026, 5);

    expect(weeks.length).toBeGreaterThanOrEqual(4);
    expect(weeks[0].days).toHaveLength(7);
    expect(weeks.some((week) => week.days.some((day) => !day.isCurrentMonth))).toBe(
      true,
    );
    expect(
      weeks.some((week) =>
        week.days.some((day) => day.isCurrentMonth && day.dayOfMonth === 1),
      ),
    ).toBe(true);
  });
});

describe('getVisibleRangeForMonth', () => {
  it('returns the full visible range for the month grid', () => {
    const range = getVisibleRangeForMonth(2026, 5);

    expect(range.start.getMonth()).toBeLessThanOrEqual(5);
    expect(range.end.getMonth()).toBeGreaterThanOrEqual(5);
    expect(range.start <= range.end).toBe(true);
  });
});

describe('groupEventsByDay', () => {
  it('groups single-day and multi-day events by overlapping days', () => {
    const weeks = buildMonthGrid(2026, 5);
    const events = [
      createEvent(
        'single',
        '2026-06-10T10:00:00.000Z',
        '2026-06-10T12:00:00.000Z',
      ),
      createEvent(
        'multi',
        '2026-06-10T18:00:00.000Z',
        '2026-06-12T10:00:00.000Z',
      ),
    ];

    const grouped = groupEventsByDay(events, weeks);
    const june10 = grouped['2026-06-10'] ?? [];
    const june11 = grouped['2026-06-11'] ?? [];
    const june12 = grouped['2026-06-12'] ?? [];

    expect(june10.map((event) => event.id)).toEqual(['single', 'multi']);
    expect(june11.map((event) => event.id)).toEqual(['multi']);
    expect(june12.map((event) => event.id)).toEqual(['multi']);
  });
});

describe('buildEventSegments', () => {
  it('splits multi-day events into weekly segments', () => {
    const weeks = buildMonthGrid(2026, 5);
    const events = [
      createEvent(
        'multi',
        '2026-06-10T10:00:00.000Z',
        '2026-06-12T10:00:00.000Z',
      ),
    ];

    const segments = buildEventSegments(events, weeks).filter(
      (segment) => segment.event.id === 'multi',
    );

    expect(segments.length).toBeGreaterThanOrEqual(1);
    expect(segments[0].span).toBeGreaterThanOrEqual(1);
  });
});
