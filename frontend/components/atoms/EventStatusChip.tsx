import { EVENT_STATUS_COLORS } from "@/features/events/event-calendar";
import { EVENT_STATUS_LABELS, type EventStatus } from "@/features/events/event-status";

type EventStatusChipProps = {
  status: EventStatus;
};

export default function EventStatusChip({ status }: EventStatusChipProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${EVENT_STATUS_COLORS[status]}`}
    >
      {EVENT_STATUS_LABELS[status]}
    </span>
  );
}
