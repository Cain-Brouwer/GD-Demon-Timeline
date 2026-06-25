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

const DIFFICULTY_TIERS = [
  { max: 50, difficulty: 'Extreme Demon' },
  { max: 200, difficulty: 'Insane Demon' },
  { max: 500, difficulty: 'Hard Demon' },
  { max: 1000, difficulty: 'Medium Demon' },
  { max: Infinity, difficulty: 'Easy Demon' },
]

function posDifficulty(pos) {
  for (const tier of DIFFICULTY_TIERS) {
    if (pos <= tier.max) return tier.difficulty
  }
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
    dateCreated: level.date_created,
    progress: 0,
    dateBeaten: 'N/A',
    apiId: level.id,
    source: 'api',
  }
}
