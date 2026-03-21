import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { searchItunes } from "@/api/itunes"
import { SearchBar } from "@/components/wallpaper/SearchBar"
import { SearchResults } from "@/components/wallpaper/SearchResults"
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview"
import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"
import { resolveBestArtwork } from "@/utils/artwork"
import {
  canvasToBlob,
  DEFAULT_BLUR_STRENGTH,
  generateWallpaper,
} from "@/utils/wallpaper"
import {
  DEFAULT_WALLPAPER_PRESET_ID,
  getDefaultWallpaperPreset,
  getWallpaperPresetById,
  WALLPAPER_PRESETS,
} from "@/utils/wallpaperPresets"

type CachedArtwork = {
  itemId: string
  image: HTMLImageElement
  resolvedUrl: string
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError"
}

function sanitizeFilenamePart(value: string): string {
  const lower = value.toLowerCase()
  let slug = ""
  let previousWasDash = false

  for (const char of lower) {
    const isLetter = char >= "a" && char <= "z"
    const isDigit = char >= "0" && char <= "9"

    if (isLetter || isDigit) {
      slug += char
      previousWasDash = false
      continue
    }

    if (!previousWasDash) {
      slug += "-"
      previousWasDash = true
    }
  }

  while (slug.startsWith("-")) {
    slug = slug.slice(1)
  }

  while (slug.endsWith("-")) {
    slug = slug.slice(0, -1)
  }

  const trimmed = slug.slice(0, 40)
  return trimmed.length > 0 ? trimmed : "wallpaper"
}

function getWallpaperFilename(
  item: ItunesSearchItem | null,
  preset: WallpaperPreset
): string {
  if (!item) {
    return `album-art-wallpaper-${preset.width}x${preset.height}.png`
  }

  const artist = sanitizeFilenamePart(item.artist)
  const title = sanitizeFilenamePart(item.title)
  return `${artist}-${title}-${preset.width}x${preset.height}-wallpaper.png`
}

function getGenerationErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "SecurityError") {
    return "This artwork cannot be exported due to remote image restrictions. Try another result."
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Wallpaper generation failed. Please try another artwork."
}

function buildWallpaperMetadata(
  item: ItunesSearchItem,
  shouldShowMetadata: boolean
): { title: string; artist: string } | null {
  if (!shouldShowMetadata) {
    return null
  }

  return {
    title: item.title,
    artist: item.artist,
  }
}

export function App() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ItunesSearchItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [blurStrength, setBlurStrength] = useState(DEFAULT_BLUR_STRENGTH)
  const [showMetadata, setShowMetadata] = useState(false)
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null)
  const [artworkSourceUrl, setArtworkSourceUrl] = useState<string | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState(
    DEFAULT_WALLPAPER_PRESET_ID
  )

  const searchControllerRef = useRef<AbortController | null>(null)
  const generationControllerRef = useRef<AbortController | null>(null)
  const generationTokenRef = useRef(0)
  const cachedArtworkRef = useRef<CachedArtwork | null>(null)
  const selectedPresetRef = useRef<WallpaperPreset>(getDefaultWallpaperPreset())
  const blurStrengthRef = useRef(DEFAULT_BLUR_STRENGTH)
  const showMetadataRef = useRef(true)

  const selectedItem = useMemo(
    () => results.find((item) => item.id === selectedId) ?? null,
    [results, selectedId]
  )
  const selectedPreset = useMemo(
    () =>
      getWallpaperPresetById(selectedPresetId) ?? getDefaultWallpaperPreset(),
    [selectedPresetId]
  )

  useEffect(() => {
    selectedPresetRef.current = selectedPreset
  }, [selectedPreset])

  useEffect(() => {
    blurStrengthRef.current = blurStrength
  }, [blurStrength])

  useEffect(() => {
    showMetadataRef.current = showMetadata
  }, [showMetadata])

  const resetWallpaper = useCallback(() => {
    setWallpaperUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return null
    })
    setArtworkSourceUrl(null)
  }, [])

  const commitGeneratedWallpaper = useCallback(
    (blob: Blob, resolvedUrl: string) => {
      const nextWallpaperUrl = URL.createObjectURL(blob)
      setWallpaperUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }

        return nextWallpaperUrl
      })
      setArtworkSourceUrl(resolvedUrl)
    },
    []
  )

  const regenerateFromCachedArtwork = useCallback(
    async (
      preset: WallpaperPreset,
      nextBlurStrength: number,
      nextShowMetadata: boolean
    ) => {
      const cachedArtwork = cachedArtworkRef.current
      if (
        !selectedItem ||
        !cachedArtwork ||
        cachedArtwork.itemId !== selectedItem.id
      ) {
        return
      }

      generationControllerRef.current?.abort()
      generationControllerRef.current = null

      const token = generationTokenRef.current + 1
      generationTokenRef.current = token

      setGenerationError(null)
      setIsGenerating(true)

      try {
        const canvas = generateWallpaper(
          cachedArtwork.image,
          preset.width,
          preset.height,
          {
            blurStrength: nextBlurStrength,
            metadata: buildWallpaperMetadata(selectedItem, nextShowMetadata),
          }
        )
        const blob = await canvasToBlob(canvas, "image/png")

        if (generationTokenRef.current !== token) {
          return
        }

        commitGeneratedWallpaper(blob, cachedArtwork.resolvedUrl)
      } catch (error) {
        setGenerationError(getGenerationErrorMessage(error))
      } finally {
        if (generationTokenRef.current === token) {
          setIsGenerating(false)
        }
      }
    },
    [commitGeneratedWallpaper, selectedItem]
  )

  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setSearchError("Enter an artist, album, or song name to search.")
      setResults([])
      setSelectedId(null)
      setHasSearched(false)
      cachedArtworkRef.current = null
      resetWallpaper()
      return
    }

    searchControllerRef.current?.abort()
    generationControllerRef.current?.abort()
    const controller = new AbortController()
    searchControllerRef.current = controller

    setIsSearching(true)
    setSearchError(null)
    setGenerationError(null)
    setSelectedId(null)
    setHasSearched(true)
    cachedArtworkRef.current = null
    resetWallpaper()

    try {
      const items = await searchItunes(trimmedQuery, controller.signal)
      setResults(items)
    } catch (error) {
      if (isAbortError(error)) {
        return
      }

      setResults([])
      setSearchError(
        error instanceof Error
          ? error.message
          : "Search failed. Please try again."
      )
    } finally {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null
        setIsSearching(false)
      }
    }
  }, [query, resetWallpaper])

  const generateWallpaperForItem = useCallback(
    async (item: ItunesSearchItem) => {
      generationControllerRef.current?.abort()
      const controller = new AbortController()
      generationControllerRef.current = controller

      const token = generationTokenRef.current + 1
      generationTokenRef.current = token

      setSelectedId(item.id)
      setGenerationError(null)
      setIsGenerating(true)
      cachedArtworkRef.current = null
      resetWallpaper()

      try {
        const { image, resolvedUrl } = await resolveBestArtwork(
          item.artworkUrl100,
          controller.signal
        )
        const activePreset = selectedPresetRef.current
        const activeBlurStrength = blurStrengthRef.current
        const activeShowMetadata = showMetadataRef.current
        const canvas = generateWallpaper(
          image,
          activePreset.width,
          activePreset.height,
          {
            blurStrength: activeBlurStrength,
            metadata: buildWallpaperMetadata(item, activeShowMetadata),
          }
        )
        const blob = await canvasToBlob(canvas, "image/png")

        if (generationTokenRef.current !== token) {
          return
        }

        cachedArtworkRef.current = {
          itemId: item.id,
          image,
          resolvedUrl,
        }
        commitGeneratedWallpaper(blob, resolvedUrl)
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        setGenerationError(getGenerationErrorMessage(error))
        resetWallpaper()
      } finally {
        if (generationControllerRef.current === controller) {
          generationControllerRef.current = null
        }

        if (generationTokenRef.current === token) {
          setIsGenerating(false)
        }
      }
    },
    [commitGeneratedWallpaper, resetWallpaper]
  )

  const handleSelectResult = useCallback(
    (item: ItunesSearchItem) => {
      void generateWallpaperForItem(item)
    },
    [generateWallpaperForItem]
  )

  const handlePresetChange = useCallback(
    (presetId: string) => {
      const nextPreset = getWallpaperPresetById(presetId)
      if (!nextPreset) {
        return
      }

      selectedPresetRef.current = nextPreset
      setSelectedPresetId(presetId)

      if (selectedItem) {
        void regenerateFromCachedArtwork(
          nextPreset,
          blurStrengthRef.current,
          showMetadataRef.current
        )
      }
    },
    [regenerateFromCachedArtwork, selectedItem]
  )

  const handleBlurChange = useCallback(
    (nextBlurStrength: number) => {
      const roundedBlurStrength = Math.round(nextBlurStrength)
      blurStrengthRef.current = roundedBlurStrength
      setBlurStrength(roundedBlurStrength)

      if (selectedItem) {
        void regenerateFromCachedArtwork(
          selectedPresetRef.current,
          roundedBlurStrength,
          showMetadataRef.current
        )
      }
    },
    [regenerateFromCachedArtwork, selectedItem]
  )

  const handleShowMetadataChange = useCallback(
    (nextShowMetadata: boolean) => {
      showMetadataRef.current = nextShowMetadata
      setShowMetadata(nextShowMetadata)

      if (selectedItem) {
        void regenerateFromCachedArtwork(
          selectedPresetRef.current,
          blurStrengthRef.current,
          nextShowMetadata
        )
      }
    },
    [regenerateFromCachedArtwork, selectedItem]
  )

  const handleDownload = useCallback(() => {
    if (!wallpaperUrl) {
      return
    }

    const link = document.createElement("a")
    link.href = wallpaperUrl
    link.download = getWallpaperFilename(selectedItem, selectedPreset)
    document.body.append(link)
    link.click()
    link.remove()
  }, [selectedItem, selectedPreset, wallpaperUrl])

  useEffect(() => {
    return () => {
      searchControllerRef.current?.abort()
      generationControllerRef.current?.abort()
      cachedArtworkRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (wallpaperUrl) {
        URL.revokeObjectURL(wallpaperUrl)
      }
    }
  }, [wallpaperUrl])

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,rgba(223,238,255,0.9),rgba(245,248,252,0.92)_42%,rgba(255,255,255,1)_100%)] text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Album Art Wallpaper Generator
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Search iTunes for any artist, album, or song, then generate a
            wallpaper with a blurred cinematic background and centered artwork.
          </p>
        </header>

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
          isLoading={isSearching}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <SearchResults
            results={results}
            selectedId={selectedId}
            isLoading={isSearching}
            hasSearched={hasSearched}
            errorMessage={searchError}
            onSelect={handleSelectResult}
          />
          <WallpaperPreview
            selectedItem={selectedItem}
            previewUrl={wallpaperUrl}
            isGenerating={isGenerating}
            errorMessage={generationError}
            artworkSourceUrl={artworkSourceUrl}
            presets={WALLPAPER_PRESETS}
            selectedPresetId={selectedPreset.id}
            onPresetChange={handlePresetChange}
            blurStrength={blurStrength}
            onBlurChange={handleBlurChange}
            showMetadata={showMetadata}
            onShowMetadataChange={handleShowMetadataChange}
            outputWidth={selectedPreset.width}
            outputHeight={selectedPreset.height}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </div>
  )
}

export default App
