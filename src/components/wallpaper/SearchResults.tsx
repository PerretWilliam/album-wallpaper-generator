import { MagnifyingGlassIcon, MusicNotesMinusIcon } from "@phosphor-icons/react"

import { EmptyState } from "@/components/wallpaper/EmptyState"
import { LoadingIndicator } from "@/components/wallpaper/LoadingIndicator"
import { ResultCard } from "@/components/wallpaper/ResultCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AppTranslations } from "@/i18n/translations"
import type { ItunesSearchItem } from "@/types/itunes"

type SearchResultsProps = {
  results: ItunesSearchItem[]
  selectedId: string | null
  isLoading: boolean
  hasSearched: boolean
  errorMessage: string | null
  onSelect: (item: ItunesSearchItem) => void
  translations: AppTranslations
}

export function SearchResults({
  results,
  selectedId,
  isLoading,
  hasSearched,
  errorMessage,
  onSelect,
  translations,
}: SearchResultsProps) {
  return (
    <Card className="rounded-2xl border border-border py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            {translations.searchResultsTitle}
          </CardTitle>
          {isLoading ? (
            <LoadingIndicator label={translations.loadingResultsLabel} />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-4">
        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !errorMessage && results.length === 0 ? (
          <EmptyState
            icon={
              hasSearched ? (
                <MusicNotesMinusIcon className="size-8" weight="duotone" />
              ) : (
                <MagnifyingGlassIcon className="size-8" weight="duotone" />
              )
            }
            title={
              hasSearched
                ? translations.emptyNotFoundTitle
                : translations.emptySearchTitle
            }
            description={
              hasSearched
                ? translations.emptyNotFoundDescription
                : translations.emptySearchDescription
            }
          />
        ) : null}

        {results.length > 0 ? (
          <ul className="grid max-h-[56vh] gap-2 overflow-y-auto pr-1">
            {results.map((item) => (
              <li key={item.id}>
                <ResultCard
                  item={item}
                  isSelected={item.id === selectedId}
                  onSelect={onSelect}
                  disabled={isLoading}
                  translations={translations}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
