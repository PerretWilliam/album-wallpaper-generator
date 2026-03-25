import type { ItunesSearchItem } from "@/types/itunes"
import type { WallpaperPreset } from "@/types/wallpaper"

import { LoadingIndicator } from "@/components/wallpaper/LoadingIndicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { type AppTranslations, translatePresetCategory } from "@/i18n/translations"
import { MAX_BLUR_STRENGTH, MIN_BLUR_STRENGTH } from "@/utils/wallpaper"
import { formatWallpaperResolution } from "@/utils/wallpaperPresets"

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
  showMetadata: boolean
  onShowMetadataChange: (checked: boolean) => void
  outputWidth: number
  outputHeight: number
  onDownload: () => void
  translations: AppTranslations
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
  showMetadata,
  onShowMetadataChange,
  outputWidth,
  outputHeight,
  onDownload,
  translations,
}: WallpaperPreviewProps) {
  const canDownload = Boolean(previewUrl) && !isGenerating
  const outputLabel = formatWallpaperResolution(outputWidth, outputHeight)
  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId
  )
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
            {translations.wallpaperPreviewTitle}
          </CardTitle>
          {isGenerating ? (
            <LoadingIndicator label={translations.generatingWallpaperLabel} />
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 py-4">
        <div className="grid gap-2">
          <Label
            htmlFor="wallpaper-preset"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {translations.presetLabel}
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
              <SelectValue placeholder={translations.presetPlaceholder}>
                {selectedPresetLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(presetsByCategory).map(([category, options]) => (
                <SelectGroup key={category}>
                  <SelectLabel>
                    {translatePresetCategory(
                      category as WallpaperPreset["category"],
                      translations
                    )}
                  </SelectLabel>
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
            <Label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {translations.blurStrengthLabel}
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
            aria-label={translations.blurStrengthAriaLabel}
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {translations.showMetadataLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {translations.showMetadataDescription}
            </p>
          </div>
          <Checkbox
            checked={showMetadata}
            onCheckedChange={(checked) =>
              onShowMetadataChange(Boolean(checked))
            }
            aria-label={translations.showMetadataAriaLabel}
          />
        </div>

        <div className="flex min-h-65 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={
                selectedItem
                  ? translations.previewGeneratedFromAlt(selectedItem.title)
                  : translations.previewGeneratedAltFallback
              }
              className="h-auto max-h-[65vh] w-auto max-w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex items-center justify-center px-6 py-10 text-center text-sm text-muted-foreground">
              {isGenerating
                ? translations.previewBuildingLabel
                : translations.previewSelectPrompt(outputLabel)}
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
            {translations.sourceSummary(
              selectedItem.title,
              selectedItem.artist,
              Boolean(artworkSourceUrl)
            )}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={onDownload}
            disabled={!canDownload}
            className="h-10 rounded-lg px-4 text-sm"
          >
            {translations.downloadButtonLabel}
          </Button>
          <span className="text-xs text-muted-foreground">
            {translations.outputLabel}: {outputLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
