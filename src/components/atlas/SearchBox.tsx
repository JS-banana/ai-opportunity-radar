"use client";

import { Icon } from "@/components/atlas/Icon";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  compact?: boolean;
  shortcut?: boolean;
};

export function SearchBox({ value, onChange, placeholder, compact = false, shortcut = false }: SearchBoxProps) {
  return (
    <label className={compact ? "search-box compact" : "search-box"}>
      <Icon name="search" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      {shortcut ? <kbd>⌘ K</kbd> : null}
      {!compact ? (
        <button type="button">
          Search
          <Icon name="arrow" />
        </button>
      ) : null}
    </label>
  );
}
