import { loadImage } from "@/utils/loadImage"

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"])

type ParsedArtworkFilename = {
  extension: string
  bbSuffix: string
}

function isAsciiDigit(char: string): boolean {
  return char >= "0" && char <= "9"
}

function readDigits(value: string, startIndex: number): {
  digits: string
  nextIndex: number
} {
  let index = startIndex
  let digits = ""
  while (index < value.length && isAsciiDigit(value[index])) {
    digits += value[index]
    index += 1
  }

  return { digits, nextIndex: index }
}

function parseArtworkFilename(filename: string): ParsedArtworkFilename | null {
  const dotIndex = filename.lastIndexOf(".")
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return null
  }

  const extension = filename.slice(dotIndex + 1).toLowerCase()
  if (!IMAGE_EXTENSIONS.has(extension)) {
    return null
  }

  const base = filename.slice(0, dotIndex)
  const widthPart = readDigits(base, 0)
  if (!widthPart.digits || widthPart.nextIndex >= base.length) {
    return null
  }

  if (base[widthPart.nextIndex] !== "x") {
    return null
  }

  const heightPart = readDigits(base, widthPart.nextIndex + 1)
  if (!heightPart.digits || heightPart.nextIndex > base.length) {
    return null
  }

  const bbSuffix = base.slice(heightPart.nextIndex)
  if (!bbSuffix.startsWith("bb")) {
    return null
  }

  return { extension, bbSuffix }
}

function withArtworkSize(url: string, size: 600 | 1000): string | null {
  const trimmed = url.trim()
  if (!trimmed) {
    return null
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(trimmed)
  } catch {
    return null
  }

  const pathSegments = parsedUrl.pathname.split("/")
  const lastSegment = pathSegments.at(-1)
  if (!lastSegment) {
    return null
  }

  const parsedFilename = parseArtworkFilename(lastSegment)
  if (!parsedFilename) {
    return null
  }

  const resizedFilename = `${size}x${size}${parsedFilename.bbSuffix}.${parsedFilename.extension}`
  pathSegments[pathSegments.length - 1] = resizedFilename
  parsedUrl.pathname = pathSegments.join("/")

  return parsedUrl.toString()
}

export function getArtworkCandidates(artworkUrl100: string): string[] {
  const base = artworkUrl100.trim()
  if (!base) {
    return []
  }

  const candidates = [withArtworkSize(base, 1000), withArtworkSize(base, 600), base]

  return [...new Set(candidates.filter((candidate): candidate is string => Boolean(candidate)))]
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError"
}

export async function resolveBestArtwork(
  artworkUrl100: string,
  signal?: AbortSignal
): Promise<{ image: HTMLImageElement; resolvedUrl: string }> {
  const candidates = getArtworkCandidates(artworkUrl100)
  if (candidates.length === 0) {
    throw new Error("Artwork URL is missing.")
  }

  for (const candidate of candidates) {
    try {
      const image = await loadImage(candidate, { signal })
      return { image, resolvedUrl: candidate }
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }
    }
  }

  throw new Error(
    "Could not load a usable artwork image. Try another result or search again."
  )
}
