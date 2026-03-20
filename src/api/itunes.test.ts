import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { normalizeItunesResults, searchItunes } from "@/api/itunes"

describe("itunes api", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("normalizes valid entries and removes duplicates", () => {
    const normalized = normalizeItunesResults({
      results: [
        {
          kind: "song",
          trackId: 10,
          trackName: "Track A",
          collectionName: "Album A",
          artistName: "Artist A",
          artworkUrl100: "https://example.com/100x100bb.jpg",
        },
        {
          kind: "song",
          trackId: 10,
          trackName: "Track A Duplicate",
          collectionName: "Album A",
          artistName: "Artist A",
          artworkUrl100: "https://example.com/100x100bb.jpg",
        },
        {
          kind: "song",
          trackId: 11,
          trackName: "Track B",
          collectionName: "Album B",
          artistName: "Artist B",
          artworkUrl100: "",
        },
      ],
    })

    expect(normalized).toHaveLength(1)
    expect(normalized[0]).toMatchObject({
      id: "song-10",
      title: "Track A",
      artist: "Artist A",
      album: "Album A",
    })
  })

  it("returns empty list for blank search term without calling fetch", async () => {
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as typeof fetch

    const result = await searchItunes("   ")

    expect(result).toEqual([])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("maps non-ok http response to a user friendly error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 503 })
    ) as typeof fetch

    await expect(searchItunes("daft punk")).rejects.toThrow(
      "iTunes Search failed (503). Please try again in a moment."
    )
  })

  it("rethrows abort errors as-is", async () => {
    const abortError = new DOMException("Aborted", "AbortError")
    globalThis.fetch = vi.fn().mockRejectedValue(abortError) as typeof fetch

    await expect(searchItunes("daft punk")).rejects.toBe(abortError)
  })
})
