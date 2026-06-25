const API_BASE = import.meta.env.VITE_DEMONLIST_API_URL || 'https://api.demonlist.org'

export async function fetchClassicDemons() {
  const res = await fetch(`${API_BASE}/level/classic/list?limit=2000`, {
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

function getYouTubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0]
    if (u.pathname.includes('/embed/')) return u.pathname.split('/embed/')[1]
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

function getThumbnail(url) {
  const id = getYouTubeId(url)
  if (!id) return null
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
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
    placement: level.placement,
    showcaseUrl: level.verification_url || '',
    thumbnail: getThumbnail(level.verification_url),
    progress: 0,
    dateBeaten: 'N/A',
    apiId: level.id,
    source: 'api',
  }
}
