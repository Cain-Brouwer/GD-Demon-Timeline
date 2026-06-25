function getGpuInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return null
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    if (!ext) return null
    return {
      renderer: (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '').toLowerCase(),
      vendor: (gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '').toLowerCase(),
    }
  } catch {
    return null
  }
}

function getMemoryGB() {
  if (typeof navigator === 'undefined') return 4
  if (navigator.deviceMemory != null) return navigator.deviceMemory
  return null
}

function getCoreCount() {
  if (typeof navigator === 'undefined') return 4
  if (navigator.hardwareConcurrency != null) return navigator.hardwareConcurrency
  return null
}

async function getBatteryInfo() {
  try {
    if (typeof navigator === 'undefined' || !navigator.getBattery) return null
    const battery = await navigator.getBattery()
    return { level: battery.level, charging: battery.charging }
  } catch {
    return null
  }
}

function getConnectionType() {
  try {
    if (typeof navigator === 'undefined') return null
    const conn = navigator.connection
    if (!conn) return null
    return conn.effectiveType || null
  } catch {
    return null
  }
}

function isMobile() {
  return typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent)
}

function isTablet() {
  return typeof navigator !== 'undefined' && /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent)
}

export function getRecommendedLevel(gpu, memory, cores, battery, connection) {
  let score = 0

  if (memory != null) {
    if (memory <= 2) score -= 3
    else if (memory <= 4) score -= 1
    else if (memory >= 8) score += 1
  }

  if (cores != null) {
    if (cores <= 2) score -= 2
    else if (cores <= 4) score -= 1
    else if (cores >= 8) score += 1
  }

  if (gpu?.renderer) {
    const r = gpu.renderer
    if (r.includes('mali') || r.includes('adreno') || r.includes('powervr')) {
      score -= 1
    }
    if (r.includes('apple') && (r.includes('gpu') || r.includes('metal'))) {
      score += 1
    }
    if (r.includes('intel') && !r.includes('arc') && !r.includes('iris xe')) {
      score -= 1
    }
    if (r.includes('nvidia') || r.includes('amd') || r.includes('radeon') || r.includes('geforce') || r.includes('arc') || r.includes('iris xe')) {
      score += 2
    }
    if (r.includes('swiftshader') || r.includes('llvmpipe') || r.includes('mesa')) {
      score -= 3
    }
  }

  if (isMobile()) score -= 1
  if (isTablet()) score -= 0

  if (connection === 'slow-2g' || connection === '2g') score -= 2
  if (connection === '3g') score -= 1

  if (battery && !battery.charging && battery.level < 0.3) score -= 1

  if (score <= -4) return 0
  if (score <= -2) return 1
  if (score <= 0) return 2
  if (score <= 2) return 3
  return 4
}

export async function detectDevice() {
  const gpu = getGpuInfo()
  const memory = getMemoryGB()
  const cores = getCoreCount()
  const battery = await getBatteryInfo()
  const connection = getConnectionType()

  const recommendedLevel = getRecommendedLevel(gpu, memory, cores, battery, connection)

  return {
    gpu,
    memory,
    cores,
    battery,
    connection,
    isMobile: isMobile(),
    isTablet: isTablet(),
    recommendedLevel,
  }
}
