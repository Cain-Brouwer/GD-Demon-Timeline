# 3D Demon Timeline

An interactive 3D timeline for tracking Geometry Dash demons (or any other achievement list). Built with React, Three.js, and Vite.

## Quick Start

```bash
npm install
npm run dev
```

## Customize

### 1. Add your demons

Edit `src/data/demons.json` — each demon needs:

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique number, determines position in timeline |
| `name` | yes | Demon/level name |
| `creator` | yes | Level creator |
| `difficulty` | yes | One of: `Easy Demon`, `Medium Demon`, `Hard Demon`, `Insane Demon`, `Extreme Demon` |
| `progress` | yes | `100` = beaten, `0` = future |
| `dateBeaten` | yes | Date string like `"2026-01-15"` or `"N/A"` for future |
| `stars` | no | Star count |
| `description` | no | Short description |
| `musicTitle` | no | Song name (shown in tooltip + mini player) |
| `musicArtist` | no | Song artist |
| `showcaseUrl` | no | YouTube URL for showcase video |
| `coins` | no | Coin count |

### 2. Change the title

Edit `src/timeline.config.js`:

```js
const config = {
  title: 'Your Custom Title',
  about: 'A short description of your timeline.',
}
```

### 3. Deploy

Built files go to `dist/`. Deploy anywhere — Netlify, Vercel, GitHub Pages, etc.

```bash
npm run build
```

## Features

- 3D timeline with difficulty-colored icons
- Click any demon to see details (tooltip)
- YouTube showcase player (video + sound-only mode)
- Add/remove custom demons via the UI
- Future/beaten status with visual distinction
- Camera controls: drag to rotate, scroll to zoom
- "Go to" and "View all" camera navigation
- Responsive layout (mobile + desktop)
- All data persists in localStorage

## Tech Stack

- React 19
- Three.js / @react-three/fiber
- @react-three/drei
- Zustand (state management)
- Vite
