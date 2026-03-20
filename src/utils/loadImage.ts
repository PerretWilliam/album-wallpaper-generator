type LoadImageOptions = {
  signal?: AbortSignal
  timeoutMs?: number
  crossOrigin?: "anonymous" | "use-credentials"
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError"
}

export function loadImage(
  url: string,
  { signal, timeoutMs = 12_000, crossOrigin = "anonymous" }: LoadImageOptions = {}
): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const source = url.trim()
    if (!source) {
      reject(new Error("No image URL was provided."))
      return
    }

    if (signal?.aborted) {
      reject(new DOMException("Image loading aborted.", "AbortError"))
      return
    }

    const image = new Image()
    let timeoutId: number | null = null
    let isSettled = false

    const finalize = (callback: () => void) => {
      if (isSettled) {
        return
      }

      isSettled = true
      image.onload = null
      image.onerror = null

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      signal?.removeEventListener("abort", onAbort)
      callback()
    }

    const onAbort = () => {
      finalize(() => {
        reject(new DOMException("Image loading aborted.", "AbortError"))
      })
    }

    image.onload = () => {
      finalize(() => resolve(image))
    }

    image.onerror = () => {
      finalize(() => reject(new Error("Image could not be loaded.")))
    }

    timeoutId = window.setTimeout(() => {
      finalize(() => reject(new Error("Image loading timed out.")))
    }, timeoutMs)

    signal?.addEventListener("abort", onAbort, { once: true })

    image.crossOrigin = crossOrigin
    image.decoding = "async"
    image.src = source
  }).catch((error: unknown) => {
    if (isAbortError(error)) {
      throw error
    }

    throw new Error(
      `Failed to load image (${url}). It may be unavailable or blocked by remote restrictions.`
    )
  })
}
