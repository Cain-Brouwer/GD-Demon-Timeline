/**
 * Stutter Debug — continuously captures frame timing data and stutter events.
 *
 * Always-on (negligible overhead):
 *   - Ring buffer of 1200 frame deltas (20s @ 60fps)
 *
 * Recording (explicit toggle via UIOverlay):
 *   - Captures detailed stutter events when delta > 50ms
 *   - Includes camera position, GPU stats, recent frame context
 *
 * UI controls are rendered in UIOverlay.jsx bottom bar.
 * Keyboard: Alt+Shift+S to download dump.
 */

const MAX_FRAMES = 1200
const MAX_STUTTER_EVENTS = 100
const STUTTER_THRESHOLD_MS = 50
const STUTTER_WARMUP_FRAMES = 10
const LS_KEY = 'stutter-debug-dump'
const RECORD_STORAGE_KEY = 'stutter-debug-recording'

const frameDeltas = new Float64Array(MAX_FRAMES)
let frameIdx = 0
let frameCount = 0
let totalFrames = 0

let stutterEvents = []
let recording = false
let startTime = 0

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
  return {
    totalFrames,
    stutterCount: stutterEvents.length,
    recording,
    duration: startTime ? Math.round((performance.now() - startTime) / 1000) : 0,
    ...(s || { avgFps: 0, p50: 0, p95: 0, p99: 0, max: 0 }),
  }
}

export function record(deltaSec, gl, camera) {
  const deltaMs = deltaSec * 1000
  frameDeltas[frameIdx] = deltaMs
  frameIdx = (frameIdx + 1) % MAX_FRAMES
  if (frameCount < MAX_FRAMES) frameCount++
  totalFrames++

  if (recording && deltaMs > STUTTER_THRESHOLD_MS && frameCount > STUTTER_WARMUP_FRAMES) {
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

  const payload = {
    captured: new Date().toISOString(),
    duration: startTime ? Math.round((now - startTime) / 1000) + 's' : '0s',
    totalFrames,
    totalStutters: stutterEvents.length,
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
    console.log(`[stutterDebug] Downloaded ${stutterEvents.length} stutter events (${Math.round(blob.size / 1024)} KB)`)
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
