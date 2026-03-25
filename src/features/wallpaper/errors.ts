import type { AppTranslations } from "@/i18n/translations"

export function extractSearchStatusCode(errorMessage: string): string | null {
  const prefix = "iTunes Search failed ("
  const start = errorMessage.indexOf(prefix)

  if (start === -1) {
    return null
  }

  const statusStart = start + prefix.length
  let statusCode = ""

  for (let index = statusStart; index < errorMessage.length; index += 1) {
    const char = errorMessage[index]
    const isDigit = char >= "0" && char <= "9"

    if (isDigit) {
      statusCode += char
      continue
    }

    if (char === ")" && statusCode.length > 0) {
      return statusCode
    }

    if (statusCode.length > 0) {
      break
    }
  }

  return null
}

export function getSearchErrorMessage(
  error: unknown,
  translations: AppTranslations
): string {
  if (!(error instanceof Error)) {
    return translations.searchGenericError
  }

  const message = error.message

  if (message.startsWith("Could not reach iTunes Search")) {
    return translations.searchNetworkError
  }

  if (message.startsWith("Received an invalid response from iTunes Search")) {
    return translations.searchInvalidResponseError
  }

  if (message.startsWith("iTunes Search failed (")) {
    return translations.searchHttpError(extractSearchStatusCode(message))
  }

  return translations.searchGenericError
}

export function getGenerationErrorMessage(
  error: unknown,
  translations: AppTranslations
): string {
  if (error instanceof DOMException && error.name === "SecurityError") {
    return translations.generationSecurityError
  }

  if (!(error instanceof Error)) {
    return translations.generationGenericError
  }

  const message = error.message

  if (message === "Artwork URL is missing.") {
    return translations.generationArtworkMissingError
  }

  if (
    message.startsWith("Could not load a usable artwork image") ||
    message.startsWith("Failed to load image (") ||
    message === "Artwork has invalid dimensions."
  ) {
    return translations.generationArtworkLoadError
  }

  if (message === "Canvas is unavailable in this browser.") {
    return translations.generationCanvasUnavailableError
  }

  if (message === "Could not export wallpaper image.") {
    return translations.generationExportError
  }

  return translations.generationGenericError
}
