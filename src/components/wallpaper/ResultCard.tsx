import { useState } from "react"

import type { AppTranslations } from "@/i18n/translations"
import type { ItunesSearchItem } from "@/types/itunes"

type ResultCardProps = {
  item: ItunesSearchItem
  isSelected: boolean
  onSelect: (item: ItunesSearchItem) => void
  disabled?: boolean
  translations: AppTranslations
}

export function ResultCard({
  item,
  isSelected,
  onSelect,
  disabled = false,
  translations,
}: ResultCardProps) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false)

  const parsedYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null
  const releaseYear =
    parsedYear !== null && Number.isFinite(parsedYear) ? String(parsedYear) : null

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      disabled={disabled}
      className={[
        "group grid w-full grid-cols-[64px_1fr] gap-3 rounded-xl border p-3 text-left transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent/30",
      ].join(" ")}
      aria-label={translations.resultAriaLabel(item.title, item.artist)}
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
        {thumbnailFailed ? (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            {translations.resultNoImageLabel}
          </div>
        ) : (
          <img
            src={item.artworkUrl100}
            alt={translations.resultArtworkAlt(item.title)}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setThumbnailFailed(true)}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.artist}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.album}
          {releaseYear ? ` • ${releaseYear}` : ""}
        </p>
      </div>
    </button>
  )
}
