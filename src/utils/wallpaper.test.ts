import { describe, expect, it, vi } from "vitest"

import {
  calculateBlurPixels,
  canvasToBlob,
  clampBlurStrength,
  DEFAULT_BLUR_STRENGTH,
  generateWallpaper,
  MAX_BLUR_STRENGTH,
  MIN_BLUR_STRENGTH,
} from "@/utils/wallpaper"

describe("wallpaper utils", () => {
  it("clamps blur strength to accepted range", () => {
    expect(clampBlurStrength(-10)).toBe(MIN_BLUR_STRENGTH)
    expect(clampBlurStrength(150)).toBe(MAX_BLUR_STRENGTH)
    expect(clampBlurStrength(Number.NaN)).toBe(DEFAULT_BLUR_STRENGTH)
    expect(clampBlurStrength(42)).toBe(42)
  })

  it("computes blur pixels from canvas size and strength", () => {
    const defaultPx = calculateBlurPixels(1920, 1080, DEFAULT_BLUR_STRENGTH)
    const lowPx = calculateBlurPixels(1920, 1080, 10)
    const highPx = calculateBlurPixels(1920, 1080, 100)

    expect(defaultPx).toBeGreaterThan(0)
    expect(lowPx).toBeLessThan(defaultPx)
    expect(highPx).toBeGreaterThan(defaultPx)
  })

  it("generates a canvas with the requested size", () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      filter: "",
      fillStyle: "",
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetY: 0,
      strokeStyle: "",
      lineWidth: 0,
    }

    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(ctx as unknown as CanvasRenderingContext2D)

    const image = document.createElement("img")
    Object.defineProperty(image, "naturalWidth", { value: 1200 })
    Object.defineProperty(image, "naturalHeight", { value: 1200 })

    const canvas = generateWallpaper(image, 2560, 1440, { blurStrength: 70 })

    expect(canvas.width).toBe(2560)
    expect(canvas.height).toBe(1440)
    expect(ctx.drawImage).toHaveBeenCalled()
    expect(ctx.filter).toContain("blur(")

    getContextSpy.mockRestore()
  })

  it("draws metadata text when enabled", () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      clip: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      measureText: vi.fn().mockReturnValue({ width: 120 }),
      fillText: vi.fn(),
      filter: "",
      fillStyle: "",
      shadowColor: "",
      shadowBlur: 0,
      shadowOffsetY: 0,
      strokeStyle: "",
      lineWidth: 0,
      textAlign: "center",
      textBaseline: "top",
      font: "",
    }

    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(ctx as unknown as CanvasRenderingContext2D)

    const image = document.createElement("img")
    Object.defineProperty(image, "naturalWidth", { value: 1200 })
    Object.defineProperty(image, "naturalHeight", { value: 1200 })

    generateWallpaper(image, 1920, 1080, {
      metadata: {
        title: "Discovery",
        artist: "Daft Punk",
      },
    })

    expect(ctx.fillText).toHaveBeenCalled()

    getContextSpy.mockRestore()
  })

  it("exports canvas to blob", async () => {
    const blob = new Blob(["wallpaper"], { type: "image/png" })
    const canvas = document.createElement("canvas")

    Object.defineProperty(canvas, "toBlob", {
      value: (callback: BlobCallback) => callback(blob),
      configurable: true,
    })

    await expect(canvasToBlob(canvas)).resolves.toBe(blob)
  })
})
