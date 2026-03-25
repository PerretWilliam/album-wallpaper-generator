import { SearchBar } from "@/components/wallpaper/SearchBar"
import { SearchResults } from "@/components/wallpaper/SearchResults"
import { WallpaperPreview } from "@/components/wallpaper/WallpaperPreview"
import { useWallpaperGenerator } from "@/features/wallpaper/useWallpaperGenerator"
import { useTranslations } from "@/i18n/translations"
import { WALLPAPER_PRESETS } from "@/utils/wallpaperPresets"

export function App() {
  const translations = useTranslations()
  const {
    query,
    setQuery,
    results,
    selectedId,
    selectedItem,
    searchError,
    generationError,
    hasSearched,
    isSearching,
    isGenerating,
    blurStrength,
    showMetadata,
    wallpaperUrl,
    artworkSourceUrl,
    selectedPreset,
    handleSearch,
    handleSelectResult,
    handlePresetChange,
    handleBlurChange,
    handleShowMetadataChange,
    handleDownload,
  } = useWallpaperGenerator(translations)

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,rgba(223,238,255,0.9),rgba(245,248,252,0.92)_42%,rgba(255,255,255,1)_100%)] text-foreground">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {translations.appTitle}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {translations.appDescription}
          </p>
        </header>

        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => {
            void handleSearch()
          }}
          isLoading={isSearching}
          translations={translations}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <SearchResults
            results={results}
            selectedId={selectedId}
            isLoading={isSearching}
            hasSearched={hasSearched}
            errorMessage={searchError}
            onSelect={handleSelectResult}
            translations={translations}
          />
          <WallpaperPreview
            selectedItem={selectedItem}
            previewUrl={wallpaperUrl}
            isGenerating={isGenerating}
            errorMessage={generationError}
            artworkSourceUrl={artworkSourceUrl}
            presets={WALLPAPER_PRESETS}
            selectedPresetId={selectedPreset.id}
            onPresetChange={handlePresetChange}
            blurStrength={blurStrength}
            onBlurChange={handleBlurChange}
            showMetadata={showMetadata}
            onShowMetadataChange={handleShowMetadataChange}
            outputWidth={selectedPreset.width}
            outputHeight={selectedPreset.height}
            onDownload={handleDownload}
            translations={translations}
          />
        </div>
      </main>
    </div>
  )
}

export default App
