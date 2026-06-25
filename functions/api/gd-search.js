const SECRET = 'Wmfd2893gb7'
const GD_API = 'https://www.boomlings.com/database/getGJLevels21.php'

const DEMON_DIFF_MAP = {
  '0': 'Hard Demon',
  '3': 'Easy Demon',
  '4': 'Medium Demon',
  '5': 'Insane Demon',
  '6': 'Extreme Demon',
}

function parseGdLevels(text) {
  const parts = text.split('#')
  if (parts.length < 5) return { levels: [], total: 0 }

  const levelStrings = parts[0].split('|').filter(Boolean)
  const creatorStrings = parts[1].split('|').filter(Boolean)
  const pageInfo = parts[3] ? parts[3].split(':') : []

  const creators = {}
  for (const cs of creatorStrings) {
    const [userId, username] = cs.split(':')
    if (userId && username) creators[userId] = username
  }

  const levels = []
  for (const ls of levelStrings) {
    const pairs = ls.split(':')
    const kv = {}
    for (let i = 0; i < pairs.length - 1; i += 2) {
      kv[pairs[i]] = pairs[i + 1]
    }

    if (kv['17'] !== '1') continue

    const demonDiffKey = kv['43']
    const difficulty = DEMON_DIFF_MAP[demonDiffKey] || 'Hard Demon'

    let description = ''
    try {
      if (kv['3']) description = atob(kv['3'])
    } catch {}

    levels.push({
      id: parseInt(kv['1']) || 0,
      name: kv['2'] || 'Unknown',
      difficulty,
      creator: creators[kv['6']] || 'Unknown',
      levelId: parseInt(kv['1']) || 0,
      stars: parseInt(kv['18']) || 0,
      description,
      downloads: parseInt(kv['10']) || 0,
      likes: parseInt(kv['14']) || 0,
      length: parseInt(kv['15']) || 0,
      coins: parseInt(kv['37']) || 0,
      verifiedCoins: kv['38'] === '1',
      epic: parseInt(kv['42']) || 0,
      objects: parseInt(kv['45']) || 0,
      twoPlayer: kv['31'] === '1',
      featureScore: parseInt(kv['19']) || 0,
      copiedID: parseInt(kv['30']) || 0,
      gameVersion: parseInt(kv['13']) || 0,
      songID: parseInt(kv['35'] || kv['12']) || 0,
    })
  }

  return {
    levels,
    total: parseInt(pageInfo[0]) || 0,
  }
}

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''
  const page = url.searchParams.get('page') || '0'

  if (!query.trim()) {
    return new Response(JSON.stringify({ levels: [], total: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = new URLSearchParams({
    secret: SECRET,
    type: '0',
    str: query.trim(),
    diff: '-2',
    star: '1',
    page,
  })

  try {
    const res = await fetch(GD_API, {
      method: 'POST',
      headers: { 'User-Agent': '' },
      body,
    })

    const text = await res.text()

    if (text === '-1') {
      return new Response(JSON.stringify({ error: 'GD server rate limited or unavailable' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = parseGdLevels(text)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
