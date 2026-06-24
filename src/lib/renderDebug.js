/**
 * Render Debug — captures a detailed snapshot of the Three.js scene state
 * every 5 seconds into a ring buffer. Exposes window.__downloadRenderDump()
 * to export the data as a downloadable JSON file.
 *
 * Usage:
 *   1. Open the app and reproduce the flicker for 30+ seconds
 *   2. Press Ctrl+Shift+D or run window.__downloadRenderDump() in console
 *   3. Place the downloaded file in the project root
 *   4. I read and analyze the dump
 */

const SNAPSHOT_INTERVAL = 5000
const MAX_SNAPSHOTS = 120
const LS_KEY = 'render-debug-dump'

let snapshots = []
let timerId = null

function round(v, d = 2) {
  if (v === null || v === undefined) return v
  return Math.round(v * Math.pow(10, d)) / Math.pow(10, d)
}

function r3(v) {
  if (!v) return null
  return [round(v.x), round(v.y), round(v.z)]
}

function matSnapshot(mat) {
  if (!mat) return null
  return {
    type: mat.type,
    transparent: mat.transparent,
    opacity: round(mat.opacity, 3),
    blending: mat.blending,
    depthTest: mat.depthTest,
    depthWrite: mat.depthWrite,
    polygonOffset: mat.polygonOffset,
    polygonOffsetFactor: mat.polygonOffsetFactor != null ? round(mat.polygonOffsetFactor, 3) : null,
    polygonOffsetUnits: mat.polygonOffsetUnits != null ? round(mat.polygonOffsetUnits, 2) : null,
    color: mat.color ? '#' + mat.color.getHexString() : null,
    map: mat.map ? `${mat.map.image?.width || '?'}x${mat.map.image?.height || '?'}` : null,
  }
}

export function takeSnapshot(camera, gl, demons, renderSettings, scene) {
  const now = performance.now()
  const fps = window.__renderDebugFps ?? 60

  const camState = {
    position: r3(camera.position),
    quaternion: camera.quaternion
      ? [round(camera.quaternion.x), round(camera.quaternion.y), round(camera.quaternion.z), round(camera.quaternion.w)]
      : null,
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
  }

  const rendererInfo = gl.info
    ? {
        autoClear: gl.autoClear,
        calls: gl.info.render?.calls,
        triangles: gl.info.render?.triangles,
        points: gl.info.render?.points,
        lines: gl.info.render?.lines,
        programs: gl.info.programs,
        geometries: gl.info.geometries,
        textures: gl.info.textures,
      }
    : { autoClear: gl.autoClear }

  // Collect all sprites and meshes from the scene
  const sceneObjects = []
  if (scene) {
    scene.traverse((obj) => {
      if (obj.isSprite || obj.isMesh) {
        sceneObjects.push({
          type: obj.isSprite ? 'sprite' : 'mesh',
          name: obj.name || '',
          renderOrder: obj.renderOrder,
          visible: obj.visible,
          frustumCulled: obj.frustumCulled,
          position: r3(obj.position),
          worldPosition: r3(obj.getWorldPosition(new THREE.Vector3())),
          material: matSnapshot(obj.material),
          // For meshes: geometry info
          ...(obj.isMesh
            ? {
                geometryType: obj.geometry?.type,
                vertexCount: obj.geometry?.attributes?.position?.count,
              }
            : {}),
        })
      }
    })
  }

  // Per-demon data directly from store (positions, IDs)
  const demonData = (demons || []).map((d) => ({
    id: d.id,
    name: d.name,
    difficulty: d.difficulty,
    position: d.position ? [round(d.position[0]), round(d.position[1] || 0), round(d.position[2] || 0)] : null,
    progress: d.progress,
    isFuture: d.progress === 0,
  }))

  const snapshot = {
    ts: Math.round(now),
    camera: camState,
    renderer: rendererInfo,
    renderSettings: renderSettings ? { ...renderSettings } : null,
    demonCount: demonData.length,
    demons: demonData,
    sceneObjects,
    sceneObjectCount: sceneObjects.length,
    fps: Math.round(fps),
  }

  snapshots.push(snapshot)
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots = snapshots.slice(-MAX_SNAPSHOTS)
  }

  // Persist to localStorage every 12 snapshots (60s)
  if (snapshots.length % 12 === 0) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(snapshots.slice(-MAX_SNAPSHOTS)))
    } catch (e) {
      try {
        snapshots = snapshots.slice(-20)
        localStorage.setItem(LS_KEY, JSON.stringify(snapshots))
      } catch {}
    }
  }
}

export function startCollector(getState, gl, camera, scene) {
  if (timerId) return
  const tick = () => {
    try {
      const st = getState()
      takeSnapshot(camera, gl, st.demons, st.renderSettings, scene)
    } catch (e) {
      console.warn('[renderDebug] snapshot error:', e.message)
    }
  }
  // First snapshot after 1s (give scene time to render)
  setTimeout(tick, 1000)
  timerId = setInterval(tick, SNAPSHOT_INTERVAL)
}

export function stopCollector() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

export function getSnapshots() {
  return snapshots
}

export function downloadDump() {
  if (snapshots.length === 0) {
    console.warn('[renderDebug] No snapshots collected yet — wait 5+ seconds')
    alert('No snapshots yet. Wait 5+ seconds and try again.')
    return
  }

  const payload = {
    captured: new Date().toISOString(),
    totalSnapshots: snapshots.length,
    intervalMs: SNAPSHOT_INTERVAL,
    snapshots,
  }

  const json = JSON.stringify(payload, null, 2)

  // Persist to localStorage
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(snapshots.slice(-MAX_SNAPSHOTS)))
  } catch {}

  // Try download via Blob
  try {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `render-debug-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log(`[renderDebug] Downloaded ${snapshots.length} snapshots (${Math.round(blob.size / 1024)} KB)`)
    return
  } catch (e) {
    console.warn('[renderDebug] Blob download failed:', e.message)
  }

  // Fallback: open in new tab
  try {
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<pre>${json}</pre>`)
      w.document.title = 'render-debug-dump.json'
      w.document.close()
      console.log('[renderDebug] Opened dump in new tab — save as .json')
      return
    }
  } catch {}

  // Last resort: alert with instructions
  alert(
    `Download failed.\n\nCopy this data from the console:\n` +
    `1. Press Ctrl+Shift+J to open console\n` +
    `2. Type: copy(JSON.stringify(window.__getRenderSnapshots()))\n` +
    `3. Paste into a file called render-debug.json`
  )
}

// Restore from localStorage on load (in case page was reloaded)
export function restoreFromStorage() {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        snapshots = parsed
        console.log(`[renderDebug] Restored ${snapshots.length} snapshots from localStorage`)
      }
    }
  } catch {}
}

// Expose globally
if (typeof window !== 'undefined') {
  window.__downloadRenderDump = downloadDump
  window.__getRenderSnapshots = getSnapshots
  window.__renderDebugSnapshots = () => snapshots

  // Test function: run window.__testRenderDebug() in console
  window.__testRenderDebug = () => {
    const s = snapshots.length
    console.log(`[renderDebug] Snapshots collected: ${s}`)
    console.log(`[renderDebug] Module loaded: true`)
    if (s > 0) {
      console.log(`[renderDebug] Latest snapshot:`, snapshots[s - 1])
    } else {
      console.warn('[renderDebug] No snapshots yet — wait 5+ seconds and try Ctrl+Shift+E')
    }
    return { loaded: true, snapshots: s }
  }

  // Alt+Shift+E to download (avoid Chrome Ctrl+Shift+D bookmark conflict)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key === 'E') {
      e.preventDefault()
      downloadDump()
    }
  })

  // Also try Ctrl+Shift+D but catch the keyup variant
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault()
      e.stopPropagation()
      downloadDump()
    }
  })

  // Last resort: a tiny clickable label at the bottom of the page
  const debugBtn = document.createElement('div')
  debugBtn.id = 'render-debug-btn'
  debugBtn.textContent = '⬇ dump'
  Object.assign(debugBtn.style, {
    position: 'fixed',
    bottom: 48,
    right: 10,
    zIndex: 99999,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontFamily: 'monospace',
    padding: '4px 8px',
    borderRadius: 4,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.12)',
    userSelect: 'none',
  })
  debugBtn.title = 'Download render debug dump (snapshots collected so far)'
  debugBtn.addEventListener('click', () => downloadDump())
  // Only add after DOM is ready
  if (document.body) {
    document.body.appendChild(debugBtn)
  } else {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(debugBtn))
  }

  // On load, try to restore previous session's data
  restoreFromStorage()
}
