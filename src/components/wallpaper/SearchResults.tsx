import type { ItunesSearchItem } from "@/types/itunes"
import { MagnifyingGlassIcon, MusicNotesMinusIcon } from "@phosphor-icons/react"

import { EmptyState } from "@/components/wallpaper/EmptyState"
import { ResultCard } from "@/components/wallpaper/ResultCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingIndicator } from "@/components/wallpaper/LoadingIndicator"

type SearchResultsProps = {
  results: ItunesSearchItem[]
  selectedId: string | null
  isLoading: boolean
  hasSearched: boolean
  errorMessage: string | null
  onSelect: (item: ItunesSearchItem) => void
}

export function SearchResults({
  results,
  selectedId,
  isLoading,
  hasSearched,
  errorMessage,
  onSelect,
}: SearchResultsProps) {
  return (
    <Card className="rounded-2xl border border-border py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Search Results
          </CardTitle>
          {isLoading ? <LoadingIndicator label="Loading results..." /> : null}
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
            title={hasSearched ? "No music found" : "Search for music"}
            description={
              hasSearched
                ? "No matching song, album, or artist was found. Try another keyword or a shorter query."
                : "Type an artist, album, or song name to find artwork and generate a wallpaper."
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
                />
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
