import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"

export function sanitizeFilenamePart(value: string): string {
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

export function getWallpaperFilename(
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
