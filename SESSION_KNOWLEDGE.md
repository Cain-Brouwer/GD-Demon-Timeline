# 3D Demon Timeline — Feature Reference

## App Overview

Interactive 3D Geometry Dash demon timeline. React 19 + Three.js (R3F/drei) + Zustand + Supabase + Cloudflare Pages.

**Live:** https://gd-demon-timeline.pages.dev

## Core Features

| Feature | Detail |
|---------|--------|
| **3D Timeline** | Demons as spheres on a spatial axis, connected by glowing threads |
| **Click/Tap tooltip** | Difficulty, progress, stats, YouTube link, edit/remove |
| **GD Server Search** | Search boomlings.com levels via `/api/gd-search` Pages Function |
| **Add/Edit/Remove** | Full CRUD via modal forms; edit supports all fields (name, creator, difficulty, progress, description, dateBeaten, YouTube URL) |
| **YouTube Mini-Player** | Sound-only player per demon with volume fade-in; supports `watch?v=`, `youtu.be/`, `/embed/` |
| **Cloud Sync** | Supabase anonymous auth, custom form (no @supabase/auth-ui-react), RLS per user |
| **Quality Levels** | 5 levels (potato→ultra); device detection via GPU, RAM, battery, network; auto-FPS adjusts dynamically |
| **Bloom** | Conditional EffectComposer mount; toggle in SettingsModal; full Canvas remount on toggle |
| **Camera** | Orbit (drag), zoom (scroll), WASD (disabled during text input) |

## Key Architecture Decisions

- **No client-side routing** (single-page)
- **EffectComposer conditionally mounted** — only renders when bloom is enabled; eliminates GPU copy-pass overhead when off
- **Canvas layer isolation** — `willChange: 'transform'` + `contain: 'strict'` forces dedicated GPU compositor layer
- **InstancedMesh for rings** — all demon rings in single draw call; distance-based visibility
- **DeviceWarning controlled by App.jsx** — never returns `null` (prevents crash during Canvas remount)
- **WASD input guard** — `document.activeElement?.tagName` check skips INPUT/TEXTAREA/SELECT

## Infrastructure

- **Hosting:** Cloudflare Pages (Netlify retired)
- **CI/CD:** GitHub Actions → push to `Main` → build + wrangler deploy
- **Env vars at build time** (VITE_ vars baked into JS by Vite)
- **Local wrangler** — `npx --no-install wrangler` in CI

## Database (Supabase)

- Table: `timelines` — `user_id (uuid PK)`, `demons (jsonb)`, `updated_at (timestamp)`
- Auth: Supabase anonymous auth, custom login form
- RLS: user reads/writes only their own row

## Debug

- `?debug` URL param → per-useFrame profiling, stutter detection, FPS/CamPos overlay
- Stutter debug in bottom bar (behind `?debug`)
