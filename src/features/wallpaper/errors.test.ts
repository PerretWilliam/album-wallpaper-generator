import { describe, expect, it } from "vitest"

import {
  extractSearchStatusCode,
  getGenerationErrorMessage,
  getSearchErrorMessage,
} from "@/features/wallpaper/errors"
import { getTranslations } from "@/i18n/translations"

describe("wallpaper errors", () => {
  const translations = getTranslations("en")

  it("extracts iTunes HTTP status code", () => {
    expect(extractSearchStatusCode("iTunes Search failed (503)")).toBe("503")
    expect(extractSearchStatusCode("iTunes Search failed ()")).toBeNull()
  })

  it("maps iTunes HTTP failure to translated error", () => {
    const error = new Error("iTunes Search failed (429)")
    expect(getSearchErrorMessage(error, translations)).toBe(
      "iTunes Search failed (429). Please try again in a moment."
    )
  })

  it("maps artwork loading failure to translated generation error", () => {
    const error = new Error("Could not load a usable artwork image (retry).")
    expect(getGenerationErrorMessage(error, translations)).toBe(
      "Could not load a usable artwork image. Try another result or search again."
    )
  })
})
