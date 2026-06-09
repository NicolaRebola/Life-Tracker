"use client";

import { useEffect, useMemo, useState } from "react";
import {
  searchEventTags,
  type EventTagSuggestion,
} from "@/features/events/events-api";

type TagFilterProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onError?: (message: string) => void;
};

export default function TagFilter({
  id = "event-tags-filter",
  value,
  onChange,
  onError,
}: TagFilterProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [suggestions, setSuggestions] = useState<EventTagSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasPendingEdit, setHasPendingEdit] = useState(false);

  const activeTagSearch = useMemo(() => {
    const tagParts = draftValue.split(",");
    return tagParts[tagParts.length - 1]?.trim() ?? "";
  }, [draftValue]);

  useEffect(() => {
    if (!hasPendingEdit) return;
    if (draftValue === value) return;

    const timeoutId = window.setTimeout(() => {
      onChange(draftValue);
      setHasPendingEdit(false);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [draftValue, hasPendingEdit, onChange, value]);

  useEffect(() => {
    if (!activeTagSearch) return;

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await searchEventTags(activeTagSearch);

        if (isCancelled) return;

        setSuggestions(response.items);
        setIsOpen(response.items.length > 0);
      } catch (error) {
        if (isCancelled) return;

        const message =
          error instanceof Error ? error.message : "No se pudieron buscar tags";
        onError?.(message);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeTagSearch, onError]);

  function handleChange(nextValue: string) {
    setDraftValue(nextValue);
    setHasPendingEdit(true);

    const lastTag = nextValue.split(",").at(-1)?.trim() ?? "";
    if (!lastTag) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  }

  function selectSuggestion(tag: EventTagSuggestion) {
    const tagParts = draftValue.split(",");
    tagParts[tagParts.length - 1] = ` ${tag.label}`;

    const nextTags = tagParts
      .map((tagPart) => tagPart.trim())
      .filter(Boolean)
      .join(", ");

    setDraftValue(nextTags);
    setHasPendingEdit(false);
    onChange(nextTags);
    setSuggestions([]);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        Filtrar por tags
      </label>
      <input
        id={id}
        value={draftValue}
        onChange={(event) => handleChange(event.currentTarget.value)}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder="Tags separados por coma"
        className="h-11 w-full rounded-2xl border border-earth-300 bg-earth-100 px-4 text-sm text-earth-900 outline-none focus:border-primary-400 focus:bg-earth-50"
      />

      {(isOpen || isSearching) && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-earth-300 bg-earth-50 shadow-lg">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-earth-500">
              Buscando tags...
            </div>
          ) : (
            suggestions.map((tag) => (
              <button
                key={tag.name}
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-earth-700 hover:bg-earth-100"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(tag)}
              >
                <span>{tag.label}</span>
                <span className="text-xs text-earth-500/80">{tag.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
