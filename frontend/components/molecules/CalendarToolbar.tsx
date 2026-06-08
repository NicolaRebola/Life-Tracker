"use client";

import CalendarNavIcon from "@/components/atoms/CalendarNavIcon";
import { Button } from "@/components/tailgrids/core/button";
import { formatMonthYear } from "@/features/events/event-calendar";

type CalendarToolbarProps = {
  visibleMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export default function CalendarToolbar({
  visibleMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-row items-baseline justify-between gap-3">
      <h2 className="text-lg font-semibold capitalize text-gray-900">
        {formatMonthYear(visibleMonth)}
      </h2>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          appearance="outline"
          variant="ghost"
          size="sm"
          onClick={onToday}
        >
          Hoy
        </Button>
        <Button
          type="button"
          appearance="outline"
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Mes anterior"
          onClick={onPreviousMonth}
        >
          <CalendarNavIcon direction="left" />
        </Button>
        <Button
          type="button"
          appearance="outline"
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Mes siguiente"
          onClick={onNextMonth}
        >
          <CalendarNavIcon direction="right" />
        </Button>
      </div>
    </div>
  );
}
