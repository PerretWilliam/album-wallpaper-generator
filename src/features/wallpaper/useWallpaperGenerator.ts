import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { searchItunes } from "@/api/itunes"
import { getGenerationErrorMessage, getSearchErrorMessage } from "@/features/wallpaper/errors"
import { getWallpaperFilename } from "@/features/wallpaper/filename"
import { buildWallpaperMetadata } from "@/features/wallpaper/metadata"
import type { AppTranslations } from "@/i18n/translations"
import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"
import { resolveBestArtwork } from "@/utils/artwork"
import { canvasToBlob, DEFAULT_BLUR_STRENGTH, generateWallpaper } from "@/utils/wallpaper"
import {
  DEFAULT_WALLPAPER_PRESET_ID,
  getDefaultWallpaperPreset,
  getWallpaperPresetById,
} from "@/utils/wallpaperPresets"

type CachedArtwork = {
  itemId: string
  image: HTMLImageElement
  resolvedUrl: string
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError"
}

export type UseWallpaperGeneratorResult = {
  query: string
  setQuery: (value: string) => void
  results: ItunesSearchItem[]
  selectedId: string | null
  selectedItem: ItunesSearchItem | null
  searchError: string | null
  generationError: string | null
  hasSearched: boolean
  isSearching: boolean
  isGenerating: boolean
  blurStrength: number
  showMetadata: boolean
  wallpaperUrl: string | null
  artworkSourceUrl: string | null
  selectedPreset: WallpaperPreset
  handleSearch: () => Promise<void>
  handleSelectResult: (item: ItunesSearchItem) => void
  handlePresetChange: (presetId: string) => void
  handleBlurChange: (nextBlurStrength: number) => void
  handleShowMetadataChange: (nextShowMetadata: boolean) => void
  handleDownload: () => void
}

export function useWallpaperGenerator(
  translations: AppTranslations
): UseWallpaperGeneratorResult {
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
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_WALLPAPER_PRESET_ID)

  const searchControllerRef = useRef<AbortController | null>(null)
  const generationControllerRef = useRef<AbortController | null>(null)
  const generationTokenRef = useRef(0)
  const cachedArtworkRef = useRef<CachedArtwork | null>(null)
  const selectedPresetRef = useRef<WallpaperPreset>(getDefaultWallpaperPreset())
  const blurStrengthRef = useRef(DEFAULT_BLUR_STRENGTH)
  const showMetadataRef = useRef(false)

  const selectedItem = useMemo(
    () => results.find((item) => item.id === selectedId) ?? null,
    [results, selectedId]
  )
  const selectedPreset = useMemo(
    () => getWallpaperPresetById(selectedPresetId) ?? getDefaultWallpaperPreset(),
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

  const commitGeneratedWallpaper = useCallback((blob: Blob, resolvedUrl: string) => {
    const nextWallpaperUrl = URL.createObjectURL(blob)
    setWallpaperUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl)
      }

      return nextWallpaperUrl
    })
    setArtworkSourceUrl(resolvedUrl)
  }, [])

  const regenerateFromCachedArtwork = useCallback(
    async (
      preset: WallpaperPreset,
      nextBlurStrength: number,
      nextShowMetadata: boolean
    ) => {
      const cachedArtwork = cachedArtworkRef.current
      if (!selectedItem || !cachedArtwork || cachedArtwork.itemId !== selectedItem.id) {
        return
      }

      generationControllerRef.current?.abort()
      generationControllerRef.current = null

      const token = generationTokenRef.current + 1
      generationTokenRef.current = token

      setGenerationError(null)
      setIsGenerating(true)

      try {
        const canvas = generateWallpaper(cachedArtwork.image, preset.width, preset.height, {
          blurStrength: nextBlurStrength,
          metadata: buildWallpaperMetadata(selectedItem, nextShowMetadata),
        })
        const blob = await canvasToBlob(canvas, "image/png")

        if (generationTokenRef.current !== token) {
          return
        }

        commitGeneratedWallpaper(blob, cachedArtwork.resolvedUrl)
      } catch (error) {
        setGenerationError(getGenerationErrorMessage(error, translations))
      } finally {
        if (generationTokenRef.current === token) {
          setIsGenerating(false)
        }
      }
    },
    [commitGeneratedWallpaper, selectedItem, translations]
  )

  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setSearchError(translations.searchEmptyQueryError)
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
      setSearchError(getSearchErrorMessage(error, translations))
    } finally {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null
        setIsSearching(false)
      }
    }
  }, [query, resetWallpaper, translations])

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
        const canvas = generateWallpaper(image, activePreset.width, activePreset.height, {
          blurStrength: activeBlurStrength,
          metadata: buildWallpaperMetadata(item, activeShowMetadata),
        })
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

        setGenerationError(getGenerationErrorMessage(error, translations))
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
    [commitGeneratedWallpaper, resetWallpaper, translations]
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

  return {
    query,
    setQuery,
    results,
    selectedId,
    selectedItem,
    searchError,
    generationError,
    hasSearched,
    isSearching,
    isGenerating,
    blurStrength,
    showMetadata,
    wallpaperUrl,
    artworkSourceUrl,
    selectedPreset,
    handleSearch,
    handleSelectResult,
    handlePresetChange,
    handleBlurChange,
    handleShowMetadataChange,
    handleDownload,
  }
}
