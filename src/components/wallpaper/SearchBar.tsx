import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AppTranslations } from "@/i18n/translations"

type SearchBarProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  translations: AppTranslations
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
  translations,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="itunes-search">
        {translations.searchInputLabel}
      </label>
      <Input
        id="itunes-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={translations.searchInputPlaceholder}
        className="h-11 flex-1 rounded-lg bg-card px-4 text-sm"
        aria-label={translations.searchInputLabel}
      />
      <Button
        type="submit"
        className="h-11 rounded-lg px-5 text-sm"
        disabled={isLoading}
      >
        {isLoading ? translations.searchingButton : translations.searchButton}
      </Button>
    </form>
  )
}
