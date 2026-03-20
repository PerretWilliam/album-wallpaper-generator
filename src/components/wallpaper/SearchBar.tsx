import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchBarProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="itunes-search">
        Search artist, album, or song
      </label>
      <Input
        id="itunes-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search artist, album, or song"
        className="h-11 flex-1 rounded-lg bg-card px-4 text-sm"
        aria-label="Search artist, album, or song"
      />
      <Button
        type="submit"
        className="h-11 rounded-lg px-5 text-sm"
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}
