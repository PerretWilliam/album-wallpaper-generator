# Album Art Wallpaper Generator

> Generate stunning 1920×1080 wallpapers from any album artwork — powered by the iTunes Search API.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

**Album Art Wallpaper Generator** is a fully client-side web app built with React and Vite.  
Search for any song, album, or artist via the iTunes API, select a result, and instantly generate a wallpaper tailored to your screen format — no backend, no account required.

---

## Features

- **iTunes Search API** — typed responses with safe fallbacks for artwork resolution (`1000x1000bb` → `600x600bb` → original)
- **Canvas-based wallpaper generation**
  - Blurred and cropped artwork as background
  - Dark overlay with gradient for readability
  - Centered cover art with rounded corners and subtle drop shadow
- **Device format presets** — Desktop, Laptop, iPhone, Google Pixel, Android, Tablet
- **Real-time blur control** — adjust blur strength with a live preview update
- **Optional metadata overlay** — show or hide album title and artist under the cover
- **Promise-based image loading** — timeout and abort support for resilient fetching
- **One-click PNG download** of the generated wallpaper
- Responsive UI with loading and error states

---

## Preview

| Search                  | Result                | Wallpaper               |
| ----------------------- | --------------------- | ----------------------- |
| Type an artist or album | Browse iTunes results | Download your wallpaper |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Available Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Start the development server   |
| `npm run build`         | Build for production           |
| `npm run typecheck`     | Run TypeScript type checking   |
| `npm run lint`          | Lint the codebase with ESLint  |
| `npm run test`          | Run the test suite with Vitest |
| `npm run test:coverage` | Generate a coverage report     |

---

## How It Works

1. **Search** — queries the iTunes Search API and parses the response with full TypeScript types.
2. **Select** — choose a result; the app resolves the best available artwork URL.
3. **Generate** — a `<canvas>` renders the wallpaper:
   - The artwork is drawn, blurred, and cropped to fill the background.
   - A dark overlay and gradient are applied for contrast.
   - The original cover is composited at the center with rounded corners and a shadow.
4. **Download** — the canvas is exported as a PNG file.

---

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- iTunes Search API (public, no key required)

---

## Author

Made by [William Perret](https://william-perret.fr)

[Website](https://william-perret.fr) · [GitHub](https://github.com/PerretWilliam) · [LinkedIn](https://www.linkedin.com/in/william-perret-7102b7327) · [Instagram](https://www.instagram.com/williamprrt/profilecard/?igsh=MWoza3kxbXpybmhybQ==) · [Buy Me a Coffee](https://buymeacoffee.com/perretwilliam)

---

## License

MIT — feel free to use, modify, and distribute.
