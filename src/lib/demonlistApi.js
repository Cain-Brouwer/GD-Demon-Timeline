const API_BASE = 'https://pointercrate.com/api/v2'

export async function fetchRankedDemons() {
  const all = []
  let after = null
  while (true) {
    const params = new URLSearchParams({ limit: 100 })
    if (after) params.set('after', after)
    const res = await fetch(`${API_BASE}/demons/listed/?${params}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break
    all.push(...data)
    if (data.length < 100) break
    after = data[data.length - 1].position
  }
  return all
}

function posDifficulty(pos) {
  if (pos <= 50) return 'Extreme Demon'
  if (pos <= 150) return 'Insane Demon'
  if (pos <= 300) return 'Hard Demon'
  if (pos <= 500) return 'Medium Demon'
  return 'Easy Demon'
}

export function mapApiDemonToApp(demon) {
  return {
    id: `api-${demon.id}`,
    name: demon.name,
    difficulty: posDifficulty(demon.position),
    stars: null,
    creator: demon.publisher?.name || 'Unknown',
    publisher: demon.publisher?.name || 'Unknown',
    verifier: demon.verifier?.name || 'Unknown',
    requirement: demon.requirement,
    levelId: demon.level_id,
    progress: 0,
    dateBeaten: 'N/A',
    showcaseUrl: demon.video || '',
    thumbnail: demon.thumbnail || null,
    apiId: demon.id,
    source: 'api',
    position: [0, 0, 0],
  }
}
