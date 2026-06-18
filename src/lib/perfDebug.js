// Performance debug utility — activated via URL param ?debug
// Usage: open https://gd-demon-timeline.pages.dev/?debug
// Output: structured console logs every 2 seconds
// Copy the output and send it back to the developer

const ENABLED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug')

// Rolling frame window
const FRAME_WINDOW = 120
const frameTimes = new Float64Array(FRAME_WINDOW)
let frameIdx = 0
let frameCount = 0
let lastFrameTime = 0

// Per-callback timing
const callbackTimes = {}
const callbackCounts = {}

// GC pause detection
let totalStutters = 0
const stutterLog = []
const MAX_STUTTER_LOG = 10

// Memory tracking
let peakMemory = 0

// FPS tracking
let fpsMin = Infinity
let fpsMax = -Infinity

// Debug overlay state
let overlayInfo = {}

const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent)

export const perf = {
  get enabled() { return ENABLED },

  // Called at the start of each frame render
  // Returns a function to call at the END of frame processing
  // Usage: const end = perf.beginFrame(); ... ; end()
  beginFrame() {
    if (!ENABLED) return () => {}
    const now = performance.now()
    if (lastFrameTime > 0) {
      const delta = now - lastFrameTime
      frameTimes[frameIdx] = delta
      frameIdx = (frameIdx + 1) % FRAME_WINDOW
      if (frameCount < FRAME_WINDOW) frameCount++
      frameIdx++
      if (frameIdx >= FRAME_WINDOW) frameIdx = 0
    }
    lastFrameTime = now
    return () => {}
  },

  // Time a specific callback
  time(label) {
    if (!ENABLED) return () => {}
    const start = performance.now()
    return () => {
      const elapsed = performance.now() - start
      if (!callbackTimes[label]) {
        callbackTimes[label] = { total: 0, min: Infinity, max: -Infinity }
        callbackCounts[label] = 0
      }
      callbackTimes[label].total += elapsed
      callbackTimes[label].min = Math.min(callbackTimes[label].min, elapsed)
      callbackTimes[label].max = Math.max(callbackTimes[label].max, elapsed)
      callbackCounts[label]++
    }
  },

  // Track a stutter event (frame drop > 50ms)
  detectStutter(delta) {
    if (!ENABLED) return
    if (delta > 50 && frameCount > 10) {
      totalStutters++
      if (stutterLog.length < MAX_STUTTER_LOG) {
        stutterLog.push({
          at: performance.now(),
          delta: Math.round(delta),
          fps: Math.round(1000 / delta),
        })
      }
    }
  },

  // Log WebGL info
  logWebGLInfo(gl) {
    if (!ENABLED || !gl) return
    try {
      const context = gl.getContext()
      const info = {
        renderer: context.getParameter(context.RENDERER),
        vendor: context.getParameter(context.VENDOR),
        version: gl.capabilities?.precision || 'unknown',
        maxTextures: gl.capabilities?.maxTextures || 'unknown',
        preserveDrawingBuffer: gl.domElement ? true : false,
        isMobile: IS_MOBILE,
        pixelRatio: window.devicePixelRatio,
        resolution: `${window.innerWidth}x${window.innerHeight}`,
      }
      console.group('🖥️  [perf] WebGL Info')
      console.table(info)
      console.groupEnd()
      overlayInfo.webgl = info
      return info
    } catch (e) {
      console.warn('[perf] Could not get WebGL info:', e.message)
    }
  },

  // Log frame stats periodically
  report(force) {
    if (!ENABLED) return
    const now = performance.now()
    if (!force && frameCount < FRAME_WINDOW) return

    // Calculate stats from rolling window
    let sum = 0, min = Infinity, max = -Infinity
    const samples = Math.min(frameCount, FRAME_WINDOW)
    for (let i = 0; i < samples; i++) {
      const d = frameTimes[i]
      sum += d
      if (d < min) min = d
      if (d > max) max = d
    }
    const avg = sum / samples
    const avgFps = 1000 / avg
    const minFps = 1000 / max
    const maxFps = 1000 / min

    if (avgFps < fpsMin) fpsMin = avgFps
    if (avgFps > fpsMax) fpsMax = avgFps

    // Sort for percentile
    const sorted = new Float64Array(samples)
    sorted.set(frameTimes.subarray(0, samples))
    sorted.sort()
    const p99 = sorted[Math.floor(samples * 0.99)]
    const p95 = sorted[Math.floor(samples * 0.95)]
    const p50 = sorted[Math.floor(samples * 0.5)]

    console.group(`📊 [perf] Frame Stats (${samples} frames)`)
    console.log(`FPS:  avg=${avgFps.toFixed(1)}  min=${minFps.toFixed(1)}  max=${maxFps.toFixed(1)}`)
    console.log(`Frame times:  p50=${p50.toFixed(2)}ms  p95=${p95.toFixed(2)}ms  p99=${p99.toFixed(2)}ms  max=${max.toFixed(2)}ms`)
    console.log(`Stutters (>50ms): ${totalStutters}`)

    if (stutterLog.length > 0) {
      console.log('Recent stutters:', stutterLog.map(s => `${s.delta}ms (${s.fps}FPS)`).join(', '))
    }

    if (typeof performance !== 'undefined' && performance.memory) {
      const mem = performance.memory
      console.log(`Memory: ${Math.round(mem.usedJSHeapSize / 1048576)}MB / ${Math.round(mem.jsHeapSizeLimit / 1048576)}MB`)
      if (mem.usedJSHeapSize > peakMemory) peakMemory = mem.usedJSHeapSize
    }

    // Per-callback breakdown
    const cbEntries = Object.entries(callbackTimes).sort((a, b) => b[1].total - a[1].total)
    if (cbEntries.length > 0) {
      console.log('\nPer-callback timing (avg per frame):')
      const cbTable = cbEntries.map(([label, t]) => ({
        label,
        calls: callbackCounts[label],
        avg: (t.total / callbackCounts[label]).toFixed(3) + 'ms',
        max: t.max.toFixed(3) + 'ms',
      }))
      console.table(cbTable)
    }

    console.groupEnd()

    overlayInfo.frame = { avgFps, minFps, maxFps, p50, p95, p99, stutters: totalStutters }
  },

  // Return accumulated data for developer to copy
  dump() {
    if (!ENABLED) return 'Debug not enabled. Add ?debug to URL.'
    try {
      this.report(true)
      console.log('\n--- Full dump ---')
      console.log(JSON.stringify({
        overlayInfo,
        callbackTimes,
        callbackCounts,
        frameCount,
        totalStutters,
        peakMemory: peakMemory ? Math.round(peakMemory / 1048576) + 'MB' : 'N/A',
        isMobile: IS_MOBILE,
        userAgent: navigator.userAgent,
      }, null, 2))
      console.log('--- End dump ---')
      return 'Dump complete. Copy the console output above.'
    } catch (e) {
      return `Dump error: ${e.message}`
    }
  },

  getOverlayInfo() { return overlayInfo },
  getFrameCount() { return frameCount },
  getTotalStutters() { return totalStutters },

  // Copy dump JSON to clipboard
  copyDump() {
    if (!ENABLED) return 'Debug disabled'
    try {
      const data = JSON.stringify({
        overlayInfo,
        callbackTimes,
        callbackCounts,
        frameCount,
        totalStutters,
        peakMemory: peakMemory ? Math.round(peakMemory / 1048576) + 'MB' : 'N/A',
        isMobile: IS_MOBILE,
        userAgent: navigator.userAgent,
      }, null, 2)
      navigator.clipboard.writeText(data)
      console.log('📋 Perf data copied to clipboard!')
      console.log(data)
      return 'Copied to clipboard!'
    } catch (e) {
      return `Copy failed: ${e.message}. Run perf.dump() manually.`
    }
  },
}

// Auto-report every 2 seconds when enabled
if (ENABLED) {
  console.log('🔍 [perf] Performance debug enabled')
  console.log('  Run perf.dump() in console for full report')
  setInterval(() => perf.report(), 2000)
}
