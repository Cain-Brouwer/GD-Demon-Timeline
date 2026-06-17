# 3D Demon Timeline

An interactive 3D timeline for tracking Geometry Dash demons. Built with React, Three.js, Vite, and Supabase.

**Live site:** [gd-demon-timeline.netlify.app](https://gd-demon-timeline.netlify.app/)

## Quick Start

```bash
npm install
npm run dev
```

The app will ask for a `VITE_APP_KEY` — set one in `.env` to unlock the app.

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_KEY` | yes | Any string — unlocks the app |
| `VITE_SUPABASE_URL` | for accounts | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | for accounts | Your Supabase anon public key |

### 2. Supabase (optional — for accounts & cloud save)

Create a free project at [supabase.com](https://supabase.com), then run this in the SQL Editor:

```sql
CREATE TABLE timelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  demons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can insert own timeline"
  ON timelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can select own timeline"
  ON timelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can update own timeline"
  ON timelines FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Add your demons

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

### 4. Change the title

Edit `src/timeline.config.js`:

```js
const config = {
  title: 'Your Custom Title',
  about: 'A short description of your timeline.',
}
```

### 5. Deploy

```bash
npm run build
```

Output goes to `dist/`. Deploy anywhere — Netlify, Vercel, GitHub Pages, etc.
On Netlify, add the same env vars in Site Settings → Environment Variables.

## Features

- 3D timeline with difficulty-colored demon icons
- White glow thread connecting demons with varying thickness
- Starfield background + floating particles in the void
- Click any demon to see details (tooltip with extra info)
- YouTube showcase player (video + sound-only fade-in mode)
- Add/remove custom demons via the UI
- Future/beaten status with visual distinction
- Camera controls: drag to rotate, scroll to zoom
- "Go to" and "View all" camera animation
- Responsive layout (mobile + desktop)
- Local data persists in localStorage
- **User accounts** via Supabase Auth (sign in / create account)
- **Cloud save/load** — sync your timeline across devices
- Auto-sync on login

## Tech Stack

- React 19
- Three.js / @react-three/fiber
- @react-three/drei
- Zustand (state management)
- Supabase (auth + database)
- Vite
