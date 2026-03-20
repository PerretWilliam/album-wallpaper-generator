import { beforeEach, describe, expect, it, vi } from "vitest"

import { getArtworkCandidates, resolveBestArtwork } from "@/utils/artwork"
import { loadImage } from "@/utils/loadImage"

vi.mock("@/utils/loadImage", () => ({
  loadImage: vi.fn(),
}))

describe("artwork utils", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("builds safe high resolution candidates", () => {
    const candidates = getArtworkCandidates(
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb.jpg"
    )

    expect(candidates).toEqual([
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/1000x1000bb.jpg",
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/600x600bb.jpg",
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb.jpg",
    ])
  })

  it("keeps Apple bb suffix variants when resizing", () => {
    const candidates = getArtworkCandidates(
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb-85.jpg"
    )

    expect(candidates).toEqual([
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/1000x1000bb-85.jpg",
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/600x600bb-85.jpg",
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb-85.jpg",
    ])
  })

  it("keeps original url if pattern is not replaceable", () => {
    const candidates = getArtworkCandidates("https://example.com/artwork.jpg")
    expect(candidates).toEqual(["https://example.com/artwork.jpg"])
  })

  it("falls back to next candidate when previous one fails", async () => {
    const mockedLoadImage = vi.mocked(loadImage)
    const fakeImage = document.createElement("img")

    mockedLoadImage
      .mockRejectedValueOnce(new Error("first failed"))
      .mockResolvedValueOnce(fakeImage)

    const result = await resolveBestArtwork(
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb.jpg"
    )

    expect(result.image).toBe(fakeImage)
    expect(result.resolvedUrl).toContain("/600x600bb.jpg")
    expect(mockedLoadImage).toHaveBeenCalledTimes(2)
  })

  it("rethrows abort errors", async () => {
    const abortError = new DOMException("Aborted", "AbortError")
    vi.mocked(loadImage).mockRejectedValueOnce(abortError)

    await expect(
      resolveBestArtwork(
        "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/abc/def/ghi/100x100bb.jpg"
      )
    ).rejects.toBe(abortError)
  })
})
