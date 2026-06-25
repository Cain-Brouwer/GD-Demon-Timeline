const DEMON_DIFF_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

const LENGTH_LABELS = {
  0: 'Tiny',
  1: 'Short',
  2: 'Medium',
  3: 'Long',
  4: 'XL',
  5: 'Platformer',
}

export async function searchGdLevels(query, page = 0) {
  const res = await fetch(`/api/gd-search?q=${encodeURIComponent(query)}&page=${page}`)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Search failed (${res.status})`)
  }
  return res.json()
}

export function mapGdLevelToDemon(level) {
  const diffColor = DEMON_DIFF_COLORS[level.difficulty] || '#ffffff'
  const lengthLabel = LENGTH_LABELS[level.length] || 'Unknown'
  return {
    id: `gd-${level.id}`,
    name: level.name,
    difficulty: level.difficulty,
    stars: level.stars,
    creator: level.creator,
    publisher: level.creator,
    verifier: 'N/A',
    requirement: null,
    levelId: level.levelId,
    points: null,
    length: lengthLabel,
    placement: null,
    showcaseUrl: null,
    thumbnail: null,
    description: level.description,
    downloads: level.downloads,
    likes: level.likes,
    coins: level.coins,
    verifiedCoins: level.verifiedCoins,
    epic: level.epic,
    objects: level.objects,
    twoPlayer: level.twoPlayer,
    songID: level.songID,
    progress: 0,
    dateBeaten: 'N/A',
    source: 'gd',
  }
}
