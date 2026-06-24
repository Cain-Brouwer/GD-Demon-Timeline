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
  // Also take a final snapshot right now
  if (snapshots.length === 0) {
    console.warn('[renderDebug] No snapshots collected yet')
    return
  }

  const data = JSON.stringify(
    {
      captured: new Date().toISOString(),
      totalSnapshots: snapshots.length,
      intervalMs: SNAPSHOT_INTERVAL,
      snapshots,
    },
    null,
    2
  )

  // Try localStorage first (persists across page reloads)
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(snapshots.slice(-MAX_SNAPSHOTS)))
  } catch {}

  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `render-debug-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  console.log(`[renderDebug] Downloaded ${snapshots.length} snapshots (${Math.round(blob.size / 1024)} KB)`)
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
  window.__downloadRenderDump = () => {
    downloadDump()
  }
  window.__getRenderSnapshots = getSnapshots
  window.__renderDebugSnapshots = snapshots

  // Ctrl+Shift+D to download
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault()
      downloadDump()
    }
  })

  // On load, try to restore previous session's data
  restoreFromStorage()
}
