import { useMemo } from "react"

import enCatalog from "@/i18n/locales/en.json"
import frCatalog from "@/i18n/locales/fr.json"
import type { WallpaperPresetCategory } from "@/types/wallpaper"

export type AppLocale = "en" | "fr"

type TranslationCatalog = {
  appTitle: string
  appDescription: string
  searchInputLabel: string
  searchInputPlaceholder: string
  searchButton: string
  searchingButton: string
  searchResultsTitle: string
  loadingResultsLabel: string
  emptySearchTitle: string
  emptySearchDescription: string
  emptyNotFoundTitle: string
  emptyNotFoundDescription: string
  wallpaperPreviewTitle: string
  generatingWallpaperLabel: string
  presetLabel: string
  presetPlaceholder: string
  blurStrengthLabel: string
  blurStrengthAriaLabel: string
  showMetadataLabel: string
  showMetadataDescription: string
  showMetadataAriaLabel: string
  previewBuildingLabel: string
  previewSelectPrompt: string
  previewGeneratedFromAlt: string
  previewGeneratedAltFallback: string
  sourceSummary: string
  sourceSummaryBestArtworkSuffix: string
  downloadButtonLabel: string
  outputLabel: string
  resultNoImageLabel: string
  resultAriaLabel: string
  resultArtworkAlt: string
  searchEmptyQueryError: string
  searchNetworkError: string
  searchHttpError: string
  searchInvalidResponseError: string
  searchGenericError: string
  generationSecurityError: string
  generationArtworkMissingError: string
  generationArtworkLoadError: string
  generationCanvasUnavailableError: string
  generationExportError: string
  generationGenericError: string
  presetCategoryLabels: Record<WallpaperPresetCategory, string>
}

export type AppTranslations = {
  appTitle: string
  appDescription: string
  searchInputLabel: string
  searchInputPlaceholder: string
  searchButton: string
  searchingButton: string
  searchResultsTitle: string
  loadingResultsLabel: string
  emptySearchTitle: string
  emptySearchDescription: string
  emptyNotFoundTitle: string
  emptyNotFoundDescription: string
  wallpaperPreviewTitle: string
  generatingWallpaperLabel: string
  presetLabel: string
  presetPlaceholder: string
  blurStrengthLabel: string
  blurStrengthAriaLabel: string
  showMetadataLabel: string
  showMetadataDescription: string
  showMetadataAriaLabel: string
  previewBuildingLabel: string
  previewSelectPrompt: (resolution: string) => string
  previewGeneratedFromAlt: (title: string) => string
  previewGeneratedAltFallback: string
  sourceSummary: (title: string, artist: string, usedBestUrl: boolean) => string
  downloadButtonLabel: string
  outputLabel: string
  resultNoImageLabel: string
  resultAriaLabel: (title: string, artist: string) => string
  resultArtworkAlt: (title: string) => string
  searchEmptyQueryError: string
  searchNetworkError: string
  searchHttpError: (statusCode: string | null) => string
  searchInvalidResponseError: string
  searchGenericError: string
  generationSecurityError: string
  generationArtworkMissingError: string
  generationArtworkLoadError: string
  generationCanvasUnavailableError: string
  generationExportError: string
  generationGenericError: string
  presetCategoryLabels: Record<WallpaperPresetCategory, string>
}

const TRANSLATION_CATALOGS = {
  en: enCatalog,
  fr: frCatalog,
} satisfies Record<AppLocale, TranslationCatalog>

function formatTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    return variables[key] ?? ""
  })
}

function buildTranslations(catalog: TranslationCatalog): AppTranslations {
  const {
    previewSelectPrompt,
    previewGeneratedFromAlt,
    sourceSummary,
    sourceSummaryBestArtworkSuffix,
    resultAriaLabel,
    resultArtworkAlt,
    searchHttpError,
    ...staticMessages
  } = catalog

  return {
    ...staticMessages,
    previewSelectPrompt: (resolution: string) =>
      formatTemplate(previewSelectPrompt, { resolution }),
    previewGeneratedFromAlt: (title: string) =>
      formatTemplate(previewGeneratedFromAlt, { title }),
    sourceSummary: (title: string, artist: string, usedBestUrl: boolean) =>
      formatTemplate(sourceSummary, {
        title,
        artist,
        bestArtworkSuffix: usedBestUrl ? sourceSummaryBestArtworkSuffix : "",
      }),
    resultAriaLabel: (title: string, artist: string) =>
      formatTemplate(resultAriaLabel, { title, artist }),
    resultArtworkAlt: (title: string) => formatTemplate(resultArtworkAlt, { title }),
    searchHttpError: (statusCode: string | null) =>
      formatTemplate(searchHttpError, {
        statusCode: statusCode ? ` (${statusCode})` : "",
      }),
  }
}

function isFrenchLanguage(language: string): boolean {
  const normalized = language.trim().toLowerCase()
  return normalized === "fr" || normalized.startsWith("fr-")
}

export function resolveLocaleFromLanguages(
  languages: readonly string[] | null | undefined
): AppLocale {
  if (!languages || languages.length === 0) {
    return "en"
  }

  for (const language of languages) {
    if (isFrenchLanguage(language)) {
      return "fr"
    }
  }

  return "en"
}

export function resolveBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return "en"
  }

  const navigatorLanguages =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language]

  return resolveLocaleFromLanguages(navigatorLanguages)
}

export function getTranslations(locale: AppLocale): AppTranslations {
  return buildTranslations(TRANSLATION_CATALOGS[locale])
}

export function useTranslations(): AppTranslations {
  const locale = useMemo(() => resolveBrowserLocale(), [])
  return useMemo(() => getTranslations(locale), [locale])
}

export function translatePresetCategory(
  category: WallpaperPresetCategory,
  translations: AppTranslations
): string {
  return translations.presetCategoryLabels[category] ?? category
}
