import { describe, expect, it } from "vitest"

import {
  getTranslations,
  resolveLocaleFromLanguages,
  translatePresetCategory,
} from "@/i18n/translations"

describe("translations", () => {
  it("detects french locale from navigator languages", () => {
    const locale = resolveLocaleFromLanguages(["en-US", "fr-FR"])

    expect(locale).toBe("fr")
  })

  it("falls back to english when french is absent", () => {
    const locale = resolveLocaleFromLanguages(["en-US", "es-ES"])

    expect(locale).toBe("en")
  })

  it("translates preset category labels by locale", () => {
    const french = getTranslations("fr")
    const english = getTranslations("en")

    expect(translatePresetCategory("Desktop", french)).toBe("Bureau")
    expect(translatePresetCategory("Desktop", english)).toBe("Desktop")
  })
})
