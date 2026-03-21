export const DEFAULT_WALLPAPER_WIDTH = 1920
export const DEFAULT_WALLPAPER_HEIGHT = 1080
export const MIN_BLUR_STRENGTH = 0
export const MAX_BLUR_STRENGTH = 100
export const DEFAULT_BLUR_STRENGTH = 55

type GenerateWallpaperOptions = {
  blurStrength?: number
  metadata?: {
    title: string
    artist: string
  } | null
}

export function clampBlurStrength(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_BLUR_STRENGTH
  }

  return Math.min(MAX_BLUR_STRENGTH, Math.max(MIN_BLUR_STRENGTH, value))
}

export function calculateBlurPixels(
  width: number,
  height: number,
  blurStrength: number
): number {
  const safeBlurStrength = clampBlurStrength(blurStrength)
  const defaultBlurPx = Math.max(width, height) * 0.03
  return Math.max(
    0,
    Math.round((defaultBlurPx * safeBlurStrength) / DEFAULT_BLUR_STRENGTH)
  )
}

function getImageDimensions(image: CanvasImageSource): { width: number; height: number } {
  if (image instanceof HTMLImageElement) {
    return { width: image.naturalWidth, height: image.naturalHeight }
  }

  if (image instanceof ImageBitmap) {
    return { width: image.width, height: image.height }
  }

  if (image instanceof HTMLCanvasElement) {
    return { width: image.width, height: image.height }
  }

  return { width: 0, height: 0 }
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const { width: sourceWidth, height: sourceHeight } = getImageDimensions(image)
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("Artwork has invalid dimensions.")
  }

  const sourceRatio = sourceWidth / sourceHeight
  const targetRatio = width / height

  let drawX = x
  let drawY = y
  let drawWidth = width
  let drawHeight = height

  if (sourceRatio > targetRatio) {
    drawWidth = height * sourceRatio
    drawX = x - (drawWidth - width) / 2
  } else {
    drawHeight = width / sourceRatio
    drawY = y - (drawHeight - height) / 2
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.quadraticCurveTo(x, y, x + safeRadius, y)
  ctx.closePath()
}

function fitTextToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  const normalized = text.trim()
  if (!normalized) {
    return ""
  }

  if (ctx.measureText(normalized).width <= maxWidth) {
    return normalized
  }

  let trimmed = normalized
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }

  return `${trimmed}…`
}

function drawArtworkMetadata(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  coverY: number,
  coverSize: number,
  metadata: { title: string; artist: string }
) {
  const titleText = metadata.title.trim()
  const artistText = metadata.artist.trim()

  if (!titleText && !artistText) {
    return
  }

  const maxTextWidth = Math.max(220, Math.min(coverSize * 1.25, width * 0.86))
  const centerX = Math.round(width / 2)
  const titleY = coverY + coverSize + Math.round(height * 0.05)
  const titleFontSize = Math.max(20, Math.round(height * 0.035))
  const artistFontSize = Math.max(16, Math.round(height * 0.024))

  ctx.save()
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)"
  ctx.shadowBlur = Math.round(height * 0.016)
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)"
  ctx.font = `700 ${titleFontSize}px "Public Sans Variable", sans-serif`

  const renderedTitle = fitTextToWidth(
    ctx,
    titleText || "Unknown title",
    maxTextWidth
  )
  ctx.fillText(renderedTitle, centerX, titleY, maxTextWidth)

  if (artistText) {
    const artistY = titleY + titleFontSize + Math.round(height * 0.012)
    ctx.fillStyle = "rgba(232, 236, 243, 0.92)"
    ctx.font = `500 ${artistFontSize}px "Public Sans Variable", sans-serif`
    const renderedArtist = fitTextToWidth(ctx, artistText, maxTextWidth)
    ctx.fillText(renderedArtist, centerX, artistY, maxTextWidth)
  }

  ctx.restore()
}

export function generateWallpaper(
  image: CanvasImageSource,
  width = DEFAULT_WALLPAPER_WIDTH,
  height = DEFAULT_WALLPAPER_HEIGHT,
  options: GenerateWallpaperOptions = {}
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas is unavailable in this browser.")
  }

  const blurPx = calculateBlurPixels(
    width,
    height,
    options.blurStrength ?? DEFAULT_BLUR_STRENGTH
  )
  const bleed = Math.max(width, height) * 0.08
  ctx.save()
  ctx.filter = `blur(${Math.max(0, blurPx)}px) saturate(1.1)`
  drawCoverImage(ctx, image, -bleed, -bleed, width + bleed * 2, height + bleed * 2)
  ctx.restore()

  ctx.fillStyle = "rgba(10, 14, 24, 0.35)"
  ctx.fillRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, "rgba(8, 12, 20, 0.18)")
  gradient.addColorStop(1, "rgba(8, 12, 20, 0.52)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const coverSize = Math.round(Math.min(width, height) * 0.54)
  const coverX = Math.round((width - coverSize) / 2)
  const metadataOffset = options.metadata ? Math.round(height * 0.055) : 0
  const coverY = Math.round((height - coverSize) / 2) - Math.round(metadataOffset / 2)
  const radius = Math.round(coverSize * 0.06)

  ctx.save()
  drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, radius)
  ctx.shadowColor = "rgba(0, 0, 0, 0.48)"
  ctx.shadowBlur = Math.round(height * 0.06)
  ctx.shadowOffsetY = Math.round(height * 0.018)
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)"
  ctx.fill()
  ctx.restore()

  ctx.save()
  drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, radius)
  ctx.clip()
  drawCoverImage(ctx, image, coverX, coverY, coverSize, coverSize)
  ctx.restore()

  ctx.save()
  drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, radius)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)"
  ctx.lineWidth = Math.max(2, Math.round(coverSize * 0.004))
  ctx.stroke()
  ctx.restore()

  if (options.metadata) {
    drawArtworkMetadata(
      ctx,
      width,
      height,
      coverY,
      coverSize,
      options.metadata
    )
  }

  return canvas
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not export wallpaper image."))
          return
        }

        resolve(blob)
      }, type)
    } catch (error) {
      reject(error)
    }
  })
}
