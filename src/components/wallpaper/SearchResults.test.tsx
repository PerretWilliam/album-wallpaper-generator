import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SearchResults } from "@/components/wallpaper/SearchResults"
import { getTranslations, resolveBrowserLocale } from "@/i18n/translations"
import type { ItunesSearchItem } from "@/types/itunes"

const sampleItem: ItunesSearchItem = {
  id: "song-1",
  title: "Around the World",
  artist: "Daft Punk",
  album: "Homework",
  artworkUrl100: "https://example.com/100x100bb.jpg",
}

function getTestTranslations() {
  return getTranslations(resolveBrowserLocale())
}

describe("SearchResults", () => {
  it("shows onboarding empty state before first search", () => {
    const translations = getTestTranslations()

    render(
      <SearchResults
        results={[]}
        selectedId={null}
        isLoading={false}
        hasSearched={false}
        errorMessage={null}
        onSelect={vi.fn()}
        translations={translations}
      />
    )

    expect(screen.getByText(translations.emptySearchTitle)).toBeInTheDocument()
  })

  it("shows not-found empty state after search with zero results", () => {
    const translations = getTestTranslations()

    render(
      <SearchResults
        results={[]}
        selectedId={null}
        isLoading={false}
        hasSearched
        errorMessage={null}
        onSelect={vi.fn()}
        translations={translations}
      />
    )

    expect(screen.getByText(translations.emptyNotFoundTitle)).toBeInTheDocument()
  })

  it("calls onSelect when a result card is clicked", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const translations = getTestTranslations()

    render(
      <SearchResults
        results={[sampleItem]}
        selectedId={null}
        isLoading={false}
        hasSearched
        errorMessage={null}
        onSelect={onSelect}
        translations={translations}
      />
    )

    await user.click(
      screen.getByRole("button", {
        name: translations.resultAriaLabel(sampleItem.title, sampleItem.artist),
      })
    )

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(sampleItem)
  })
})
