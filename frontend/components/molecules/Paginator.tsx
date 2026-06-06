"use client";

import { Button } from "@/components/tailgrids/core/button";

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

type PaginatorProps = {
  page: number;
  limit: PageSize;
  total: number;
  totalPages: number;
  isDisabled?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: PageSize) => void;
};

export default function Paginator({
  page,
  limit,
  total,
  totalPages,
  isDisabled = false,
  onPageChange,
  onLimitChange,
}: PaginatorProps) {
  const hasResults = total > 0;
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-gray-600">
        {hasResults
          ? `Página ${page} de ${safeTotalPages} (${total} eventos)`
          : "Sin eventos para mostrar"}
      </p>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:flex">
        <label className="sr-only" htmlFor="event-page-size">
          Eventos por página
        </label>
        <select
          id="event-page-size"
          value={limit}
          onChange={(event) =>
            onLimitChange(Number(event.currentTarget.value) as PageSize)
          }
          className="h-10 min-w-0 rounded-xl border border-gray-200 bg-gray-100 px-3 text-sm font-medium text-gray-900 outline-none focus:border-gray-400 focus:bg-white"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} por página
            </option>
          ))}
        </select>

        <Button
          type="button"
          appearance="outline"
          variant="ghost"
          size="sm"
          disabled={page <= 1 || isDisabled}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          appearance="outline"
          variant="ghost"
          size="sm"
          disabled={page >= totalPages || totalPages === 0 || isDisabled}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
