import { describe, expect, it } from "vitest"

import {
  getWallpaperFilename,
  sanitizeFilenamePart,
} from "@/features/wallpaper/filename"
import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"

describe("wallpaper filename", () => {
  it("sanitizes filename parts to lowercase slug", () => {
    expect(sanitizeFilenamePart("Daft Punk !!!")).toBe("daft-punk")
  })

  it("falls back when value has no alphanumeric characters", () => {
    expect(sanitizeFilenamePart("###")).toBe("wallpaper")
  })

  it("builds a deterministic wallpaper filename", () => {
    const item: ItunesSearchItem = {
      id: "abc",
      title: "Around the World",
      artist: "Daft Punk",
      album: "Homework",
      artworkUrl100: "https://example.com/cover.jpg",
    }
    const preset: WallpaperPreset = {
      id: "desktop-fhd",
      name: "Full HD",
      width: 1920,
      height: 1080,
      category: "Desktop",
    }

    expect(getWallpaperFilename(item, preset)).toBe(
      "daft-punk-around-the-world-1920x1080-wallpaper.png"
    )
  })
})
