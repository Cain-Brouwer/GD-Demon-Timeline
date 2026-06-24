/**
 * Stutter Debug — continuously captures frame timing data and stutter events.
 *
 * Detection tiers:
 *   - JITTER (15ms): frame pacing jitter — irreguliere frame intervals
 *   - STUTTER (30ms): merkbare framedrop (~33fps)
 *   - SEVERE (50ms): zware framedrop (~20fps)
 *
 * Always-on (negligible overhead):
 *   - Ring buffer van 1200 frame deltas (20s @ 60fps)
 *   - Frame pacing jitter score (coefficient of variation, 0-100)
 *
 * Recording (explicit toggle via UIOverlay):
 *   - Logt alle events met camera pos, GPU stats, recente deltas
 *
 * UI controls worden gerenderd in UIOverlay.jsx bottom bar.
 * Keyboard: Alt+Shift+S to download dump.
 */

const MAX_FRAMES = 1200
const MAX_STUTTER_EVENTS = 200
const WARMUP_FRAMES = 10
const LS_KEY = 'stutter-debug-dump'
const RECORD_STORAGE_KEY = 'stutter-debug-recording'

/* Detection thresholds */
const JITTER_MS = 15
const STUTTER_MS = 25
const SEVERE_MS = 50

/* Jitter detection — rolling variance window */
const JITTER_WINDOW = 10
const JITTER_STDDEV_THRESHOLD = 5

function stddev(arr, n, mean) {
  let sumSq = 0
  for (let i = 0; i < n; i++) {
    const d = arr[i] - mean
    sumSq += d * d
  }
  return Math.sqrt(sumSq / n)
}

/* Ring buffer state */
const frameDeltas = new Float64Array(MAX_FRAMES)
let frameIdx = 0
let frameCount = 0
let totalFrames = 0

/* Jitter rolling window */
const jitterWindow = new Float64Array(JITTER_WINDOW)
let jitterWIdx = 0
let jitterWCount = 0

/* Event tracking */
let stutterEvents = []
let recording = false
let startTime = 0

/* Running counts (altijd, ook zonder recording) */
let totalJitterEvents = 0
let totalStutterEvents = 0
let totalSevereEvents = 0
let jitterCooldown = 0

function round(v, d) {
  if (d === undefined) d = 2
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d)
}

function computeStats() {
  const n = Math.min(frameCount, MAX_FRAMES)
  if (n === 0) return null

  let sum = 0, max = 0
  for (let i = 0; i < n; i++) {
    const d = frameDeltas[i]
    sum += d
    if (d > max) max = d
  }

  const avg = sum / n
  const sorted = new Float64Array(n)
  sorted.set(frameDeltas.subarray(0, n))
  sorted.sort()

  return {
    avgFps: round(1000 / avg, 1),
    p50: round(sorted[Math.floor(n * 0.5)], 2),
    p95: round(sorted[Math.floor(n * 0.95)], 2),
    p99: round(sorted[Math.floor(n * 0.99)], 2),
    max: round(max, 2),
    frames: n,
  }
}

export function getStats() {
  const s = computeStats()
  const jMean = computeJitterMean()
  const jSd = jMean > 0 ? computeJitterStddev(jMean) : 0
  const jScore = jMean > 0 ? Math.max(0, Math.min(100, round(100 - (jSd / jMean) * 100, 1))) : 100

  return {
    totalFrames,
    jitterCount: totalJitterEvents,
    stutterCount: totalStutterEvents,
    severeCount: totalSevereEvents,
    jitterScore: jScore,
    recording,
    duration: startTime ? Math.round((performance.now() - startTime) / 1000) : 0,
    ...(s || { avgFps: 0, p50: 0, p95: 0, p99: 0, max: 0 }),
  }
}

function computeJitterMean() {
  const n = Math.min(jitterWCount, JITTER_WINDOW)
  if (n < 3) return 0
  let sum = 0
  for (let i = 0; i < n; i++) sum += jitterWindow[i]
  return sum / n
}

function computeJitterStddev(mean) {
  const n = Math.min(jitterWCount, JITTER_WINDOW)
  return stddev(jitterWindow, n, mean)
}

function pushEvent(deltaMs, type, gl, camera) {
  const recent = []
  const n = Math.min(frameCount, 20)
  let idx = (frameIdx - 1 + MAX_FRAMES) % MAX_FRAMES
  for (let i = 0; i < n; i++) {
    recent.push(round(frameDeltas[idx]))
    idx = (idx - 1 + MAX_FRAMES) % MAX_FRAMES
  }
  recent.reverse()

  stutterEvents.push({
    ts: performance.now(),
    type,
    delta: round(deltaMs, 1),
    fps: Math.round(1000 / deltaMs),
    camera: camera ? [round(camera.position.x), round(camera.position.y), round(camera.position.z)] : null,
    gl: gl?.info
      ? { calls: gl.info.render?.calls ?? 0, triangles: gl.info.render?.triangles ?? 0 }
      : null,
    recentDeltas: recent,
  })
  if (stutterEvents.length > MAX_STUTTER_EVENTS) stutterEvents.shift()
}

export function record(deltaSec, gl, camera) {
  const deltaMs = deltaSec * 1000
  const warmedUp = frameCount > WARMUP_FRAMES

  /* Ring buffer */
  frameDeltas[frameIdx] = deltaMs
  frameIdx = (frameIdx + 1) % MAX_FRAMES
  if (frameCount < MAX_FRAMES) frameCount++
  totalFrames++

  /* Jitter window */
  jitterWindow[jitterWIdx] = deltaMs
  jitterWIdx = (jitterWIdx + 1) % JITTER_WINDOW
  if (jitterWCount < JITTER_WINDOW) jitterWCount++

  /* Jitter detection — std dev van rolling window > 5ms = pacing jitter
     Cooldown van JITTER_WINDOW frames na een jitter voorkomt dat 1 spike
     10 events genereert (de spike moet door het hele window schuiven). */
  if (jitterCooldown > 0) jitterCooldown--
  const jMean = computeJitterMean()
  const jSd = jMean > 0 ? computeJitterStddev(jMean) : 0
  const isJitter = warmedUp && jitterWCount >= JITTER_WINDOW && jSd > JITTER_STDDEV_THRESHOLD

  if (isJitter && jitterCooldown === 0) {
    jitterCooldown = JITTER_WINDOW
    totalJitterEvents++
    if (recording) pushEvent(deltaMs, 'jitter', gl, camera)
  }

  /* Stutter detection — delta > 30ms */
  if (warmedUp && deltaMs > STUTTER_MS) {
    totalStutterEvents++
    if (recording) pushEvent(deltaMs, 'stutter', gl, camera)
  }

  /* Severe detection — delta > 50ms */
  if (warmedUp && deltaMs > SEVERE_MS) {
    totalSevereEvents++
    if (recording) pushEvent(deltaMs, 'severe', gl, camera)
  }
}

export function startRecording() {
  recording = true
  startTime = performance.now()
  stutterEvents = []
  try { localStorage.setItem(RECORD_STORAGE_KEY, '1') } catch { /* private browsing */ }
}

export function stopRecording() {
  recording = false
  try { localStorage.removeItem(RECORD_STORAGE_KEY) } catch { /* private browsing */ }
}

export function isRecording() {
  return recording
}

export function downloadDump() {
  const stats = computeStats()
  const now = performance.now()
  const jMean = computeJitterMean()
  const jSd = jMean > 0 ? computeJitterStddev(jMean) : 0
  const jScore = jMean > 0 ? Math.max(0, Math.min(100, round(100 - (jSd / jMean) * 100, 1))) : 100

  const payload = {
    captured: new Date().toISOString(),
    duration: startTime ? Math.round((now - startTime) / 1000) + 's' : '0s',
    totalFrames,
    jitterCount: totalJitterEvents,
    stutterCount: totalStutterEvents,
    severeCount: totalSevereEvents,
    jitterScore: jScore,
    jitterThreshold: JITTER_MS,
    stutterThreshold: STUTTER_MS,
    severeThreshold: SEVERE_MS,
    jitterStddevThreshold: JITTER_STDDEV_THRESHOLD,
    recording,
    frameStats: stats || { avgFps: 0, p50: 0, p95: 0, p99: 0, max: 0 },
    stutterEvents: stutterEvents.slice(),
  }

  const json = JSON.stringify(payload, null, 2)
  try { localStorage.setItem(LS_KEY, json) } catch { /* private browsing */ }

  try {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stutter-debug-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log(`[stutterDebug] Downloaded ${stutterEvents.length} events (${Math.round(blob.size / 1024)} KB)`)
    return
  } catch { /* fallback below */ }

  try {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<pre>${json}</pre>`)
      w.document.title = 'stutter-debug-dump.json'
      w.document.close()
      return
    }
  } catch { /* last resort below */ }

  alert(
    `Download failed.\n\nCopy from console:\n` +
    `copy(JSON.stringify(__stutterDebug?.getStats()))`
  )
}

/* Keyboard shortcut + global exposure */
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault()
      downloadDump()
    }
  })

  window.__stutterDebug = { getStats, startRecording, stopRecording, downloadDump }
  try { if (localStorage.getItem(RECORD_STORAGE_KEY) === '1') { recording = true; startTime = performance.now() } }
  catch { /* private browsing */ }
}
