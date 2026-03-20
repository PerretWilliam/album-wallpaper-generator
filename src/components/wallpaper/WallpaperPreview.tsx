import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"

import { LoadingIndicator } from "@/components/wallpaper/LoadingIndicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatWallpaperResolution } from "@/utils/wallpaperPresets"
import { MAX_BLUR_STRENGTH, MIN_BLUR_STRENGTH } from "@/utils/wallpaper"

type WallpaperPreviewProps = {
  selectedItem: ItunesSearchItem | null
  previewUrl: string | null
  isGenerating: boolean
  errorMessage: string | null
  artworkSourceUrl: string | null
  presets: WallpaperPreset[]
  selectedPresetId: string
  onPresetChange: (presetId: string) => void
  blurStrength: number
  onBlurChange: (blurStrength: number) => void
  outputWidth: number
  outputHeight: number
  onDownload: () => void
}

export function WallpaperPreview({
  selectedItem,
  previewUrl,
  isGenerating,
  errorMessage,
  artworkSourceUrl,
  presets,
  selectedPresetId,
  onPresetChange,
  blurStrength,
  onBlurChange,
  outputWidth,
  outputHeight,
  onDownload,
}: WallpaperPreviewProps) {
  const canDownload = Boolean(previewUrl) && !isGenerating
  const outputLabel = formatWallpaperResolution(outputWidth, outputHeight)
  const selectedPreset = presets.find((preset) => preset.id === selectedPresetId)
  const selectedPresetLabel = selectedPreset
    ? `${selectedPreset.name} (${selectedPreset.width}x${selectedPreset.height})`
    : null

  const presetsByCategory = presets.reduce<Record<string, WallpaperPreset[]>>(
    (groups, preset) => {
      const current = groups[preset.category] ?? []
      current.push(preset)
      groups[preset.category] = current
      return groups
    },
    {}
  )

  return (
    <Card className="rounded-2xl border border-border py-0">
      <CardHeader className="border-b border-border py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Wallpaper Preview
          </CardTitle>
          {isGenerating ? <LoadingIndicator label="Generating wallpaper..." /> : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 py-4">
        <div className="grid gap-2">
          <Label
            htmlFor="wallpaper-preset"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Device format preset
          </Label>
          <Select
            value={selectedPresetId}
            onValueChange={(value) => {
              if (value) {
                onPresetChange(value)
              }
            }}
          >
            <SelectTrigger
              id="wallpaper-preset"
              className="h-10 w-full rounded-lg bg-card px-3 text-sm"
            >
              <SelectValue placeholder="Select wallpaper format preset">
                {selectedPresetLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(presetsByCategory).map(([category, options]) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {options.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} ({preset.width}x{preset.height})
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Blur Strength
            </Label>
            <span className="text-xs font-semibold text-foreground">
              {Math.round(blurStrength)}%
            </span>
          </div>
          <Slider
            min={MIN_BLUR_STRENGTH}
            max={MAX_BLUR_STRENGTH}
            step={1}
            value={[blurStrength]}
            onValueChange={(values) => {
              const nextValue = Array.isArray(values) ? values[0] : values
              if (typeof nextValue === "number") {
                onBlurChange(nextValue)
              }
            }}
            aria-label="Blur strength"
          />
        </div>

        <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={
                selectedItem
                  ? `Wallpaper generated from ${selectedItem.title}`
                  : "Generated wallpaper preview"
              }
              className="max-h-[65vh] h-auto w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex items-center justify-center px-6 py-10 text-center text-sm text-muted-foreground">
              {isGenerating
                ? "Building preview..."
                : `Select a result to generate a ${outputLabel} wallpaper.`}
            </div>
          )}
        </div>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {selectedItem ? (
          <p className="text-xs text-muted-foreground">
            Source: {selectedItem.title} • {selectedItem.artist}
            {artworkSourceUrl ? " • best artwork URL resolved" : ""}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={onDownload}
            disabled={!canDownload}
            className="h-10 rounded-lg px-4 text-sm"
          >
            Download PNG
          </Button>
          <span className="text-xs text-muted-foreground">Output: {outputLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}
