# GD Demon Timeline

An interactive 3D Geometry Dash demon timeline built with React 19, Three.js, and Supabase.

**Live → [gd-demon-timeline.pages.dev](https://gd-demon-timeline.pages.dev/)**

## Features

- **3D spatial timeline** — demons rendered on a timeline axis with glowing connection threads, instanced rings per difficulty, and a black hole at the end
- **Search & add demons via GD servers** — search the official Geometry Dash level database directly from the UI; add demons with full metadata (name, creator, difficulty, stars, description)
- **Edit/insert/remove** — full CRUD on your demon list through modal forms
- **YouTube showcase** — sound-only YouTube mini-player per demon with volume fade-in; `watch?v=`, `youtu.be/`, `/embed/` URL support
- **Tooltip on click** — click any demon sphere for difficulty, progress, stats, YouTube link, and edit/remove controls
- **Cloud sync** — create an account to persist your timeline to Supabase; anonymous auth with no third-party UI
- **Adaptive quality** — 5 quality levels (potato→ultra) with automatic device detection (GPU, RAM, battery, network); auto-FPS adjusts on-the-fly
- **Bloom toggle** — conditional EffectComposer mount; only active when bloom is enabled, eliminating GPU copy-pass overhead when off
- **Camera controls** — drag to orbit, scroll to zoom, WASD for first-person movement (disabled during text input)
- **Debug tooling** — `?debug` URL param enables per-useFrame profiling, stutter detection, and FPS/CamPos overlays
- **Performance tested** — DeviceWarning shows GPU/RAM info + recommended quality level on first visit/app reload for anonymous users

## Stack

React 19, Three.js (@react-three/fiber + drei), Zustand, Supabase, Vite, Cloudflare Pages (CI/CD via GitHub Actions)
