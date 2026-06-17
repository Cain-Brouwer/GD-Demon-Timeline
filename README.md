# 3D Demon Timeline

A interactive 3D Geometry Dash demon timeline built with React, Three.js, and Supabase.

Explore, track, and visualize demons in a fully 3D space — with glowing connection threads, a starfield void, and cloud-synced accounts.

**Live demo → [gd-demon-timeline.netlify.app](https://gd-demon-timeline.netlify.app/)**

## What it does

- Renders demons as 3D objects on a spatial timeline
- Connecting glow threads that pulse and vary in thickness
- Click any demon for details — difficulty, progress, YouTube showcase, music info
- Create an account to save your timeline to the cloud and access it anywhere
- Add, insert, and remove custom demons through the UI
- Sound-only YouTube player with volume fade-in
- Camera animations: fly to any demon or zoom out to see all

## Built with

- **React 19** + **Three.js** (react-three-fiber, drei)
- **Zustand** for state + localStorage persistence
- **Supabase** for auth and cloud storage
- **Vite**

## Run locally

```bash
npm install
npm run dev
```

Set `VITE_APP_KEY` in `.env` to unlock the app.
