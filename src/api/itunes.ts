import type { ItunesSearchItem } from "@/types/itunes"

const ITUNES_SEARCH_ENDPOINT = "https://itunes.apple.com/search"
const SEARCH_LIMIT = 40

type ItunesResponse = {
  results?: unknown[]
}

type ItunesRawResult = {
  wrapperType?: unknown
  kind?: unknown
  trackId?: unknown
  collectionId?: unknown
  artistId?: unknown
  trackName?: unknown
  collectionName?: unknown
  artistName?: unknown
  artworkUrl100?: unknown
  releaseDate?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError"
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function parseSearchItem(raw: ItunesRawResult): ItunesSearchItem | null {
  const artworkUrl100 = asString(raw.artworkUrl100)
  const artist = asString(raw.artistName)

  if (!artworkUrl100 || !artist) {
    return null
  }

  const title =
    asString(raw.trackName) ??
    asString(raw.collectionName) ??
    asString(raw.artistName) ??
    "Untitled"

  const album =
    asString(raw.collectionName) ??
    (asString(raw.wrapperType) === "collection" ? title : "Single")

  const identifier =
    asNumber(raw.trackId) ??
    asNumber(raw.collectionId) ??
    asNumber(raw.artistId) ??
    `${artist}:${title}:${album}`

  const kind = asString(raw.kind) ?? asString(raw.wrapperType) ?? "music"
  const releaseDate = asString(raw.releaseDate)

  return {
    id: `${kind}-${identifier}`,
    title,
    artist,
    album,
    artworkUrl100,
    releaseDate: releaseDate ?? undefined,
  }
}

export function normalizeItunesResults(payload: unknown): ItunesSearchItem[] {
  if (!isRecord(payload)) {
    return []
  }

  const data = payload as ItunesResponse
  if (!Array.isArray(data.results)) {
    return []
  }

  const seenIds = new Set<string>()
  const items: ItunesSearchItem[] = []

  for (const entry of data.results) {
    if (typeof entry !== "object" || entry === null) {
      continue
    }

    const item = parseSearchItem(entry as ItunesRawResult)
    if (!item || seenIds.has(item.id)) {
      continue
    }

    seenIds.add(item.id)
    items.push(item)
  }

  return items
}

export async function searchItunes(
  query: string,
  signal?: AbortSignal
): Promise<ItunesSearchItem[]> {
  const term = query.trim()
  if (!term) {
    return []
  }

  const params = new URLSearchParams({
    term,
    media: "music",
    limit: String(SEARCH_LIMIT),
  })

  let response: Response
  try {
    response = await fetch(`${ITUNES_SEARCH_ENDPOINT}?${params}`, { signal })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new Error(
      "Could not reach iTunes Search right now. Check your connection and try again."
    )
  }

  if (!response.ok) {
    throw new Error(
      `iTunes Search failed (${response.status}). Please try again in a moment.`
    )
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error("Received an invalid response from iTunes Search.")
  }

  return normalizeItunesResults(payload)
}
