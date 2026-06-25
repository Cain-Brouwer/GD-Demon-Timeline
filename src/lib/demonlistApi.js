const API_BASE = import.meta.env.VITE_DEMONLIST_API_URL || 'https://api.demonlist.org'

export async function fetchClassicDemons() {
  const res = await fetch(`${API_BASE}/level/classic/list?limit=1000`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (json.message !== 'success') throw new Error(json.message)
  return json.data.levels
}

function posDifficulty(pos) {
  if (pos <= 50) return 'Extreme Demon'
  if (pos <= 150) return 'Insane Demon'
  if (pos <= 300) return 'Hard Demon'
  if (pos <= 500) return 'Medium Demon'
  return 'Easy Demon'
}

export function mapApiDemonToApp(level) {
  return {
    id: `api-${level.id}`,
    name: level.name,
    difficulty: posDifficulty(level.placement),
    stars: null,
    creator: level.holder,
    publisher: level.holder,
    verifier: level.verifier?.username || 'Unknown',
    requirement: level.list_percent,
    levelId: level.ingame_id,
    points: level.points,
    length: level.length,
    showcaseUrl: level.verification_url || '',
    thumbnail: null,
    progress: 0,
    dateBeaten: 'N/A',
    apiId: level.id,
    source: 'api',
  }
}
