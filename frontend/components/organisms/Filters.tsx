"use client";

import { useEffect, useRef, useState } from "react";
import TagFilter from "@/components/molecules/TagFilter";
import Paginator, { type PageSize } from "@/components/molecules/Paginator";
import { Button } from "@/components/tailgrids/core/button";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  type EventStatus,
} from "@/features/events/event-status";

type FiltersProps = {
  name: string;
  status: EventStatus | "";
  tags: string;
  page: number;
  limit: PageSize;
  total: number;
  totalPages: number;
  isDisabled?: boolean;
  onNameChange: (name: string) => void;
  onStatusChange: (status: EventStatus | "") => void;
  onTagsChange: (tags: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSize) => void;
  onError?: (message: string) => void;
};

function MoreFiltersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M3 5H17M6 10H14M9 15H11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusFilter({
  id,
  value,
  onChange,
}: {
  id: string;
  value: EventStatus | "";
  onChange: (status: EventStatus | "") => void;
}) {
  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        Filtrar por estado
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.currentTarget.value as EventStatus | "")
        }
        className="h-11 w-full appearance-none rounded-2xl border border-gray-200 bg-gray-100 px-4 text-sm font-medium text-gray-900 outline-none focus:border-gray-400 focus:bg-white"
      >
        <option value="">Todos los estados</option>
        {EVENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {EVENT_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Filters({
  name,
  status,
  tags,
  page,
  limit,
  total,
  totalPages,
  isDisabled = false,
  onNameChange,
  onStatusChange,
  onTagsChange,
  onPageChange,
  onLimitChange,
  onError,
}: FiltersProps) {
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMoreFiltersOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!popoverRef.current?.contains(event.target as Node)) {
        setIsMoreFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreFiltersOpen]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 md:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
        <div>
          <label className="sr-only" htmlFor="event-name-filter">
            Buscar por nombre
          </label>
          <input
            id="event-name-filter"
            value={name}
            onChange={(event) => onNameChange(event.currentTarget.value)}
            placeholder="Buscar por nombre"
            className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 text-sm text-gray-900 outline-none focus:border-gray-400 focus:bg-white"
          />
        </div>

        <div className="relative md:hidden" ref={popoverRef}>
          <Button
            type="button"
            appearance="outline"
            variant="ghost"
            size="md"
            iconOnly
            aria-label="Mostrar filtros avanzados"
            aria-expanded={isMoreFiltersOpen}
            onClick={() => setIsMoreFiltersOpen((isOpen) => !isOpen)}
          >
            <MoreFiltersIcon />
          </Button>

          {isMoreFiltersOpen && (
            <div className="absolute right-0 z-40 mt-2 flex w-[min(calc(100vw-2rem),22rem)] flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
              <StatusFilter
                id="event-status-filter-mobile"
                value={status}
                onChange={onStatusChange}
              />
              <TagFilter
                key={`mobile-tags-${tags}`}
                id="event-tags-filter-mobile"
                value={tags}
                onChange={onTagsChange}
                onError={onError}
              />
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <StatusFilter
            id="event-status-filter"
            value={status}
            onChange={onStatusChange}
          />
        </div>

        <div className="hidden md:block">
          <TagFilter
            key={`desktop-tags-${tags}`}
            id="event-tags-filter"
            value={tags}
            onChange={onTagsChange}
            onError={onError}
          />
        </div>
      </div>

      <Paginator
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        isDisabled={isDisabled}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
