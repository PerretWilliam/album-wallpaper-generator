import type { ItunesSearchItem } from "@/types/itunes"

export function buildWallpaperMetadata(
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
