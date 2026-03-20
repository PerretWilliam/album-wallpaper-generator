import type { WallpaperPreset } from "@/types/wallpaper"

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: "desktop-fhd",
    name: "Full HD",
    width: 1920,
    height: 1080,
    category: "Desktop",
  },
  {
    id: "desktop-qhd",
    name: "QHD",
    width: 2560,
    height: 1440,
    category: "Desktop",
  },
  {
    id: "desktop-uwqhd",
    name: "UltraWide QHD",
    width: 3440,
    height: 1440,
    category: "Desktop",
  },
  {
    id: "desktop-4k",
    name: "4K UHD",
    width: 3840,
    height: 2160,
    category: "Desktop",
  },
  {
    id: "desktop-5k",
    name: "5K",
    width: 5120,
    height: 2880,
    category: "Desktop",
  },
  {
    id: "laptop-macbook-air",
    name: "MacBook Air 13\"",
    width: 2560,
    height: 1664,
    category: "Laptop",
  },
  {
    id: "laptop-macbook-pro-14",
    name: "MacBook Pro 14\"",
    width: 3024,
    height: 1964,
    category: "Laptop",
  },
  {
    id: "laptop-macbook-pro-16",
    name: "MacBook Pro 16\"",
    width: 3456,
    height: 2234,
    category: "Laptop",
  },
  {
    id: "laptop-surface",
    name: "Surface Laptop Studio",
    width: 2400,
    height: 1600,
    category: "Laptop",
  },
  {
    id: "iphone-se",
    name: "iPhone SE / 8",
    width: 750,
    height: 1334,
    category: "iPhone",
  },
  {
    id: "iphone-11",
    name: "iPhone 11 / XR",
    width: 828,
    height: 1792,
    category: "iPhone",
  },
  {
    id: "iphone-13-14",
    name: "iPhone 13 / 14",
    width: 1170,
    height: 2532,
    category: "iPhone",
  },
  {
    id: "iphone-14-plus",
    name: "iPhone 14 Plus",
    width: 1284,
    height: 2778,
    category: "iPhone",
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    width: 1179,
    height: 2556,
    category: "iPhone",
  },
  {
    id: "iphone-15-plus",
    name: "iPhone 15 Plus",
    width: 1290,
    height: 2796,
    category: "iPhone",
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    width: 1179,
    height: 2556,
    category: "iPhone",
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    category: "iPhone",
  },
  {
    id: "pixel-6",
    name: "Pixel 6 / 7",
    width: 1080,
    height: 2400,
    category: "Google Pixel",
  },
  {
    id: "pixel-6-pro",
    name: "Pixel 6 Pro",
    width: 1440,
    height: 3120,
    category: "Google Pixel",
  },
  {
    id: "pixel-7a",
    name: "Pixel 7a",
    width: 1080,
    height: 2400,
    category: "Google Pixel",
  },
  {
    id: "pixel-8",
    name: "Pixel 8",
    width: 1080,
    height: 2400,
    category: "Google Pixel",
  },
  {
    id: "pixel-8-pro",
    name: "Pixel 8 Pro",
    width: 1344,
    height: 2992,
    category: "Google Pixel",
  },
  {
    id: "pixel-9",
    name: "Pixel 9",
    width: 1080,
    height: 2424,
    category: "Google Pixel",
  },
  {
    id: "pixel-9-pro-xl",
    name: "Pixel 9 Pro XL",
    width: 1344,
    height: 2992,
    category: "Google Pixel",
  },
  {
    id: "android-galaxy-s24",
    name: "Galaxy S24",
    width: 1080,
    height: 2340,
    category: "Android",
  },
  {
    id: "android-galaxy-s24-plus",
    name: "Galaxy S24+",
    width: 1440,
    height: 3120,
    category: "Android",
  },
  {
    id: "android-galaxy-s24-ultra",
    name: "Galaxy S24 Ultra",
    width: 1440,
    height: 3120,
    category: "Android",
  },
  {
    id: "tablet-ipad-mini",
    name: "iPad mini",
    width: 1488,
    height: 2266,
    category: "Tablet",
  },
  {
    id: "tablet-ipad-air",
    name: "iPad Air 11\"",
    width: 1640,
    height: 2360,
    category: "Tablet",
  },
  {
    id: "tablet-ipad-pro-11",
    name: "iPad Pro 11\"",
    width: 1668,
    height: 2420,
    category: "Tablet",
  },
  {
    id: "tablet-ipad-pro-13",
    name: "iPad Pro 13\"",
    width: 2064,
    height: 2752,
    category: "Tablet",
  },
  {
    id: "tablet-galaxy-tab-s9",
    name: "Galaxy Tab S9",
    width: 1600,
    height: 2560,
    category: "Tablet",
  },
  {
    id: "tablet-surface-pro",
    name: "Surface Pro",
    width: 2880,
    height: 1920,
    category: "Tablet",
  },
]

export const DEFAULT_WALLPAPER_PRESET_ID = "desktop-fhd"

export function getWallpaperPresetById(
  presetId: string
): WallpaperPreset | null {
  return WALLPAPER_PRESETS.find((preset) => preset.id === presetId) ?? null
}

export function getDefaultWallpaperPreset(): WallpaperPreset {
  return (
    getWallpaperPresetById(DEFAULT_WALLPAPER_PRESET_ID) ?? WALLPAPER_PRESETS[0]
  )
}

export function formatWallpaperResolution(
  width: number,
  height: number
): string {
  return `${width}x${height}`
}
