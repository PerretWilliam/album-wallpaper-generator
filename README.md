# Album Art Wallpaper Generator

Frontend-only web app built with React + Vite.  
Search iTunes for a song/album/artist, select a result, generate a 1920x1080
wallpaper from the album art, preview it, and download it as PNG.

## Features

- iTunes Search API integration with typed parsing
- Artwork URL resolution with safe fallbacks (`1000x1000bb`, `600x600bb`, original)
- Promise-based image loading helper with timeout + abort support
- Device format presets (Desktop, Laptop, iPhone, Google Pixel, Android, Tablet)
- Real-time blur strength setting with live preview update
- Canvas-based wallpaper generation:
  - blurred cropped background from artwork
  - dark overlay + gradient
  - centered cover with rounded corners and subtle shadow
- Responsive UI with loading and error states
- Download generated wallpaper as PNG

## Run Locally

```bash
npm install
npm run dev
```

Build and checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Coverage report:

```bash
npm run test:coverage
```
