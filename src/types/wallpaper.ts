export type WallpaperPresetCategory =
  | "Desktop"
  | "Laptop"
  | "Tablet"
  | "iPhone"
  | "Google Pixel"
  | "Android"

export type WallpaperPreset = {
  id: string
  name: string
  width: number
  height: number
  category: WallpaperPresetCategory
}
