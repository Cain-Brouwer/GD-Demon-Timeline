# Session Knowledge — Geometry Dash Demon Timeline

## Project Overview
A 3D interactive Geometry Dash Demon Timeline visualization built with React + Vite + Three.js. Shows all 19 original GD demons (Up to date as of early 2024: Acheron, Slaughterhouse, etc.) as 3D spheres in a timeline, with difficulty icons, connecting lines, and full CRUD management.

## Directory Structure (after rename)

```
Side Projects/
  GD-Demon-Timeline/          ← Template (clean, example data, no .git, no .env)
    src/
      data/demons.json        ← 2 example demons
      timeline.config.js      ← Configurable title, about, githubUrl
      assets/icons/           ← 5 difficulty PNGs
      components/             ← All React components
      store/timelineStore.js  ← Zustand store
      App.jsx                 ← Root component (NO env gate for template)
    package.json
    vite.config.js
    index.html
    README.md

  personal/                   ← Personal copy (real 19 demons, .env, git)
    src/
      data/demons.json        ← 19 original demons + custom
      App.jsx                 ← Has env-gated lock screen (VITE_APP_KEY)
    .env                      ← Contains VITE_APP_KEY
    .git                      ← Remote: git@github.com:Cain-Brouwer/GeoDash-Timeline-personal.git
    (same structure as template otherwise)

  GD_Demon_Timeline/          ← Old parent folder, now only has Recources/ (source materials)

  SESSION_KNOWLEDGE.md        ← This file
```

## Git Remotes
- **personal/** → `git@github.com:Cain-Brouwer/GeoDash-Timeline-personal.git` (branch: `Main`)
- Template heeft geen git (is voor publicatie/exports)

## How to Run
```bash
npm install
npm run dev
```

## How to Build
```bash
npm run build
# Output in dist/
```

## Deployment (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- Live site (original): https://gd-timeline.netlify.app
- Personal site: bijgewerkt via `git push origin Main` → Netlify auto-deploy

## Features
- 3D timeline with equally spaced spheres (25 units apart)
- Demon order follows id order (not date-sorted)
- Difficulty face PNGs on spheres, not affected by camera zoom
- Click tooltip below icon with "Watch Showcase" and "Sound Only" buttons
- Connecting lines between consecutive demons
- Floating animation on spheres
- "Future" badge + grayscale for unbeaten demons (dateBeaten="N/A")
- Add custom demon with auto-incrementing IDs (20+), original 1-19 protected
- Insert at specific ID shifts existing demons up by 1
- Remove demon requires typing name to confirm
- YouTube modal (fullscreen) + mini-player (bottom bar, hidden YT.Player)
- Sound-only mode: audio-only mini-player bottom bar, no video
- Camera animation: cubic-out lerp on both camera.position and controls.target
- View-all overview camera position
- Responsive UI: left panel (stats, legend), right panel (demon list, add, view-all, docs), bottom bar (controls hint)
- Collapsible panels + hamburger menu on mobile
- createPortal for all overlays (z-index 9999)
- Zustand persist middleware (localStorage, key: 'gd-timeline-storage')
- Vanilla CSS, backdrop-filter blur on panels
- Docs modal with full feature documentation

## Key Technical Decisions
- **HTML `<img>` inside drei `<Html>`** instead of Three.js sprites (avoids texture-loading issues)
- **No distanceFactor on tooltip** — scales naturally with camera distance
- **zIndexRange={[0,0]} on icons/labels**, zIndexRange={[1,1]} on tooltip — fixes stacking vs UI overlays
- **createPortal for all overlays** — ensures correct z-index above 3D content
- **Key-based remount** (`key={youtubeVideoId}`) on YouTubeMiniPlayer to prevent stale YT.Player state
- **partialize** in Zustand persist: only store `demons` array
- **Env gating**: personal app uses `VITE_APP_KEY` env var; template has no env gate
- **CameraAnimator**: separate component that watches store triggers, lerps both position and target

## Demon Data
- 9 Easy, 2 Medium, 3 Hard, 2 Insane, 3 Extreme
- 8 demons have dateBeaten="N/A" (future/unbeaten)
- Original IDs: 1-19 (protected)
- Custom IDs: auto-increment starting at 20
- Picture-in-picture icon size: 80×80 RGBA PNG with transparency
- Icon files: `Easy-Demon.png`, `Medium-Demon.png`, `Hard-Demon.png`, `Insane-Demon.png`, `Extreme-Demon.png`

## Components (src/components/)
| File | Purpose |
|------|---------|
| DemonSphere.jsx | 3D sphere + difficulty icon + glow disc + floating animation + click/hover |
| TimelineLines.jsx | Connecting lines between consecutive demons |
| TimelineScene.jsx | Canvas + OrbitControls + CameraAnimator + Tooltip |
| UIOverlay.jsx | Responsive left/right panels + bottom bar + hamburger menu |
| YouTubeModal.jsx | Fullscreen YouTube iframe overlay |
| YouTubeMiniPlayer.jsx | Hidden YT.Player + bottom mini-player bar |
| AddDemonModal.jsx | Form for adding/inserting custom demons |
| DocsModal.jsx | Feature documentation |

## Store (src/store/timelineStore.js)
- `demons` array (persisted to localStorage)
- `addDemon({name, creator, difficulty, position/insertId, dateBeaten, progress, music, youtubeUrl, description})`
- `removeDemon(id)` — requires name confirmation in UI
- `initDemons(initialDemons)` — seed from JSON
- `viewAllTrigger` — increments to trigger camera animation
- `youtubeVideoId` / `youtubeSoundOnly` — current track
- `cameraTarget` — { position, target } for CameraAnimator

## Picture-in-Picture Icons (src/assets/icons/)
```
Easy-Demon.png      — blue/teal demon face
Medium-Demon.png    — green demon face
Hard-Demon.png      — red/orange demon face
Insane-Demon.png    — purple demon face
Extreme-Demon.png   — pink/magenta demon face
```
All 80×80 RGBA PNGs with transparency.
