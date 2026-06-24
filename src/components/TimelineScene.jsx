import { useEffect } from 'react'
import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useTimelineStore } from '../store/timelineStore'
import { perf } from '../lib/perfDebug'
import EditDemonModal from './EditDemonModal'
import DemonSphere, { ICON_MAP } from './DemonSphere'
import TimelineLines from './TimelineLines'

function getYouTubeId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0]
    if (u.pathname.includes('/embed/')) return u.pathname.split('/embed/')[1]
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
  'Impossible Level': '#ffdd99',
}

function Tooltip({ demon }) {
  const [showExtra, setShowExtra] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const setYoutubeVideo = useTimelineStore((s) => s.setYoutubeVideo)
  const videoId = demon.showcaseUrl ? getYouTubeId(demon.showcaseUrl) : null

  return (
    <Html position={demon.position} center zIndexRange={[1, 1]}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontFamily: 'monospace',
          border: `2px solid ${DIFFICULTY_COLORS[demon.difficulty]}`,
          transform: 'translateY(115px)',
          minWidth: 180,
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
          {demon.name}
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
          by {demon.creator}
        </div>
        <div
          style={{
            color: DIFFICULTY_COLORS[demon.difficulty],
            marginBottom: 4,
          }}
        >
          {demon.difficulty}{demon.stars ? ` \u2605 ${demon.stars}` : ''}
        </div>
        <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>
          {demon.progress === 0 ? (
            <span style={{ color: '#888', fontStyle: 'italic' }}>Future Demon</span>
          ) : (
            demon.dateBeaten
          )}
        </div>

        {showExtra && (
          <>
            {demon.musicTitle && demon.musicArtist && (
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 6 }}>
                {demon.musicTitle} — {demon.musicArtist}
              </div>
            )}
            {demon.description && (
              <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4, maxWidth: 250 }}>
                {demon.description}
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setShowExtra((v) => !v)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            cursor: 'pointer',
            width: '100%',
            marginBottom: videoId ? 4 : 0,
          }}
        >
          {showExtra ? '−' : '+'} extra info
        </button>
        {videoId && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setYoutubeVideo(videoId, false)}
              style={{
                flex: 1,
                background: '#ff0033',
                border: 'none',
                color: 'white',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              ▶ Watch Showcase
            </button>
            <button
              onClick={() => setYoutubeVideo(videoId, true)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              ♫ Sound Only
            </button>
          </div>
        )}
        {demon.name !== 'TON 618' && (
          <button
            onClick={() => setShowEdit(true)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
              marginTop: videoId ? 4 : 0,
              opacity: 0.6,
            }}
          >
            ✎ Edit
          </button>
        )}
      </div>
      {showEdit && <EditDemonModal demon={demon} onClose={() => setShowEdit(false)} />}
    </Html>
  )
}

function CameraAnimator() {
  const { camera, controls } = useThree()
  const goToPosition = useTimelineStore((s) => s.goToPosition)
  const clearGoToPosition = useTimelineStore((s) => s.clearGoToPosition)
  const viewAllTrigger = useTimelineStore((s) => s.viewAllTrigger)
  const demons = useTimelineStore((s) => s.demons)
  const animRef = useRef(null)
  const lastTrigger = useRef(0)

  useFrame(() => {
    if (!controls) return

    const isViewAll = viewAllTrigger !== lastTrigger.current
    if (isViewAll) {
      lastTrigger.current = viewAllTrigger
      animRef.current = null
    }

    if (!animRef.current && isViewAll && demons.length > 0) {
      const xs = demons.map((d) => d.position[0])
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const centerX = (minX + maxX) / 2
      const width = Math.max(maxX - minX, 100)
      const camZ = Math.max(width * 0.8, 50)

      animRef.current = {
        start: performance.now(),
        fromCam: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toCam: new THREE.Vector3(centerX, camZ * 0.5, camZ),
        toTarget: new THREE.Vector3(centerX, 0, 0),
        onDone: () => {},
      }
    } else if (!animRef.current && goToPosition) {
      animRef.current = {
        start: performance.now(),
        fromCam: camera.position.clone(),
        fromTarget: controls.target.clone(),
        toCam: new THREE.Vector3(goToPosition[0], 10, 25),
        toTarget: new THREE.Vector3(goToPosition[0], 0, goToPosition[2]),
        onDone: clearGoToPosition,
      }
    }

    if (!animRef.current) return

    const elapsed = performance.now() - animRef.current.start
    const t = Math.min(elapsed / 600, 1)
    const ease = 1 - Math.pow(1 - t, 3)

    camera.position.lerpVectors(animRef.current.fromCam, animRef.current.toCam, ease)
    controls.target.lerpVectors(animRef.current.fromTarget, animRef.current.toTarget, ease)
    controls.update()

    if (t >= 1) {
      animRef.current.onDone()
      animRef.current = null
    }
  }, undefined, [viewAllTrigger, demons, goToPosition, clearGoToPosition])

  return null
}

function Starfield({ bounds }) {
  const starsRef = useRef()
  
  // Dynamically determine star count based on device
  const starCount = useMemo(() => {
    const pixelCount = (typeof window !== 'undefined' ? window.innerWidth * window.innerHeight * (window.devicePixelRatio || 1) : 2073600)
    const isHighRes = pixelCount > 2073600 // > 1440p
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent)
    if (isMobile || isHighRes) return 800
    return 1500
  }, [])
  
  const { positions, colors, sizes } = useMemo(() => {
    const count = starCount
    const margin = 100
    const xRange = bounds.width / 2 + margin
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = bounds.centerX + (Math.random() - 0.5) * xRange * 2
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400
      pos[i * 3 + 2] = (Math.random() - 0.5) * 500

      const tint = Math.random()
      if (tint < 0.6) {
        col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1
      } else if (tint < 0.8) {
        col[i * 3] = 0.7; col[i * 3 + 1] = 0.8; col[i * 3 + 2] = 1
      } else if (tint < 0.95) {
        col[i * 3] = 1; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.6
      } else {
        col[i * 3] = 1; col[i * 3 + 1] = 0.4; col[i * 3 + 2] = 0.8
      }

      siz[i] = 0.15 + Math.random() * 0.5
    }
    return { positions: pos, colors: col, sizes: siz }
  }, [bounds, starCount])

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00012
    }
  })

  return (
    <points ref={starsRef} renderOrder={-10000}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={starCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={starCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={starCount} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.35} vertexColors transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Nebula({ bounds }) {
  
  // Dynamically determine nebula count based on device
  const nebulaCount = useMemo(() => {
    const pixelCount = (typeof window !== 'undefined' ? window.innerWidth * window.innerHeight * (window.devicePixelRatio || 1) : 2073600)
    const isHighRes = pixelCount > 2073600 // > 1440p
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent)
    if (isMobile) return 25
    if (isHighRes) return 30
    return 45
  }, [])
  
  const pointsRef = useRef()
  const baseData = useRef([])

  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.15)')
    g.addColorStop(0.3, 'rgba(255,255,255,0.06)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.02)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])

  const { positions, colors } = useMemo(() => {
    const count = nebulaCount
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const colorList = [
      [0.4, 0.15, 0.7], [0.7, 0.2, 0.5], [0.2, 0.1, 0.6],
      [0.5, 0.1, 0.3], [0.3, 0.2, 0.7], [0.6, 0.25, 0.4],
      [0.15, 0.05, 0.5], [0.8, 0.3, 0.6], [0.25, 0.15, 0.65],
    ]

    const bd = baseData.current
    bd.length = 0
    for (let i = 0; i < count; i++) {
      const c = colorList[Math.floor(Math.random() * colorList.length)]
      const bright = 0.3 + Math.random() * 0.7
      const x = bounds.centerX + (Math.random() - 0.5) * (bounds.width + 200)
      const y = (Math.random() - 0.5) * 200 + 10
      const z = (Math.random() - 0.5) * 500
      bd.push({ baseX: x, baseY: y, baseZ: z })
      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      col[i * 3] = c[0] * bright
      col[i * 3 + 1] = c[1] * bright
      col[i * 3 + 2] = c[2] * bright
    }
    return { positions: pos, colors: col }
  }, [bounds, nebulaCount])

  useFrame(() => {
    const end = perf.time('Nebula')
    if (!pointsRef.current) { end(); return }
    const t = Date.now()
    const pos = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < nebulaCount; i++) {
      const d = baseData.current[i]
      if (!d) continue
      pos[i * 3] = d.baseX + Math.sin(t * 0.0003 + i) * 10
      pos[i * 3 + 1] = d.baseY + Math.sin(t * 0.0004 + i * 1.3) * 5
      pos[i * 3 + 2] = d.baseZ
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    end()
  }, undefined, [nebulaCount])

  return (
    <points ref={pointsRef} renderOrder={-10000}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={nebulaCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={nebulaCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        map={cloudTexture}
        size={60}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.04}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Ton618BlackHole() {
  const groupRef = useRef()

  const diskTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    for (let x = 0; x < 1024; x++) {
      const t = x / 1024
      let r, g, b, a
      if (t < 0.05) {
        r = 255; g = 255; b = 255; a = 0
      } else if (t < 0.12) {
        const s = (t - 0.05) / 0.07
        r = 255; g = 200 + 55 * s; b = 150 + 105 * s; a = s * 0.9
      } else if (t < 0.3) {
        const s = (t - 0.12) / 0.18
        r = 255; g = 255 - 80 * s; b = 255 - 160 * s; a = 0.9 - s * 0.3
      } else if (t < 0.55) {
        const s = (t - 0.3) / 0.25
        r = 255 - 60 * s; g = 175 - 75 * s; b = 95 - 40 * s; a = 0.6 - s * 0.2
      } else if (t < 0.8) {
        const s = (t - 0.55) / 0.25
        r = 195 - 95 * s; g = 100 - 60 * s; b = 55 - 35 * s; a = 0.4 - s * 0.2
      } else {
        const s = Math.min((t - 0.8) / 0.2, 1)
        r = 100 - 80 * s; g = 40 - 35 * s; b = 20 - 18 * s; a = 0.2 * (1 - s)
      }
      ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${Math.max(0, a)})`
      ctx.fillRect(x, 0, 1, 128)
    }
    for (let i = 0; i < 30; i++) {
      const x = (0.08 + Math.random() * 0.7) * 1024
      const w = 2 + Math.random() * 6
      ctx.fillStyle = `rgba(255,255,255,${0.05 + Math.random() * 0.15})`
      ctx.fillRect(x, 0, w, 128)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  const lensTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,220,180,0)')
    g.addColorStop(0.35, 'rgba(255,200,150,0)')
    g.addColorStop(0.45, 'rgba(255,200,150,0.35)')
    g.addColorStop(0.5, 'rgba(255,180,120,0.5)')
    g.addColorStop(0.55, 'rgba(255,200,150,0.35)')
    g.addColorStop(0.65, 'rgba(255,220,180,0)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(canvas)
  }, [])

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,200,150,0.12)')
    g.addColorStop(0.2, 'rgba(255,180,120,0.06)')
    g.addColorStop(0.5, 'rgba(200,100,50,0.02)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0008
    }
  })

  const tilt = Math.PI * 0.25

  return (
    <group ref={groupRef} position={[60, -10, -80]}>
      <mesh rotation={[tilt, 0, 0]}>
        <ringGeometry args={[14, 60, 80]} />
        <meshBasicMaterial map={diskTexture} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[tilt, 0, 0]}>
        <ringGeometry args={[12.5, 14.5, 64]} />
        <meshBasicMaterial color="#ffdd99" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[14, 60, 80]} />
        <meshBasicMaterial map={lensTexture} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[8, 28, 28]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh>
        <sphereGeometry args={[8.3, 28, 28]} />
        <meshBasicMaterial color="#ffdd99" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[25, 24, 24]} />
        <meshBasicMaterial map={glowTexture} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[tilt - 0.3, 0, 0]} position={[0, 12, 0]}>
        <coneGeometry args={[2, 20, 12]} />
        <meshBasicMaterial color="#ffdd99" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI - (tilt - 0.3), 0, 0]} position={[0, -12, 0]}>
        <coneGeometry args={[2, 20, 12]} />
        <meshBasicMaterial color="#ffdd99" transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  )
}

const TON_618_DATA = {
  id: 20,
  name: "TON 618",
  creator: "Team Space",
  creatorRealName: "Spanyel, Platnuu & more",
  difficulty: "Impossible Level",
  duration: "1:07",
  description: "A legendary cosmic-apocalyptic project named after one of the largest known supermassive black holes.",
  theme: "Cosmic/Hell/Impossible",
  releaseDate: "2021-09-18",
  dateBeaten: "N/A",
  musicTitle: "Ton 618",
  musicArtist: "Djjaner",
  levelID: 73783685,
  gameVersion: "2.11",
  series: "Illusion List / Impossible Levels",
  notes: "Originally built as an unpassable humanly impossible level requiring absurdly high CPS and frame-perfect 360Hz+ execution. Highly prominent on the Illusion List before various nerfed versions were made for top-tier players.",
  progress: 0,
  keyMechanics: ["Extreme Wave (zero-pixel margins)", "High CPS Spam", "Tight Ship Corridors", "UFO", "Ball"],
  showcaseUrl: "https://www.youtube.com/watch?v=KexhCTpuQZY",
  position: [80, -35, -300],
}

function BlackHole() {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/black_hole.glb')
  const selectDemon = useTimelineStore((s) => s.selectDemon)

  useEffect(() => {
    if (scene) {
      let idx = 0
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false
          child.geometry.computeBoundingSphere()
          child.material.depthWrite = true
          child.material.polygonOffset = true
          child.material.polygonOffsetFactor = -1 - idx * 0.01
          child.material.polygonOffsetUnits = -1
          idx++
        }
      })
    }
  }, [scene])

  const handleClick = (e) => {
    e.stopPropagation()
    selectDemon(TON_618_DATA)
  }

  return (
    <group ref={groupRef} position={[80, -40, -300]} scale={[0.15, 0.15, 0.15]}>
      <primitive object={scene} />
      <mesh onClick={handleClick}>
        <sphereGeometry args={[1000, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ShootingStars({ bounds }) {
  const count = 6
  const meshes = useRef([])
  const boundsRef = useRef(bounds)
  boundsRef.current = bounds
  const state = useRef(
    Array.from({ length: count }, () => ({
      active: false,
      timer: Math.random() * 20,
      x: 0, y: 0, z: 0,
      dx: 0, dy: 0, dz: 0,
      life: 0,
    }))
  )

  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.1, 'rgba(255,255,220,0.8)')
    g.addColorStop(0.3, 'rgba(255,220,180,0.3)')
    g.addColorStop(0.6, 'rgba(200,180,255,0.08)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame(({ clock }) => {
    const end = perf.time('ShootingStars')
    for (let i = 0; i < count; i++) {
      const s = state.current[i]
      const mesh = meshes.current[i]
      if (!mesh) continue

      if (!s.active) {
        s.timer -= 0.016
        mesh.visible = false
        if (s.timer <= 0) {
          s.active = true
          s.life = 0
          const angle = Math.random() * Math.PI * 2
          const b = boundsRef.current
          s.x = b.centerX + (Math.random() - 0.5) * b.width * 1.2
          s.y = 100 + Math.random() * 120
          s.z = (Math.random() - 0.5) * b.width * 0.4
          const speed = 80 + Math.random() * 60
          s.dx = -Math.cos(angle) * speed
          s.dy = -(10 + Math.random() * 20)
          s.dz = -Math.sin(angle) * speed * 0.6
        }
      } else {
        s.life += 0.016
        s.x += s.dx * 0.016
        s.y += s.dy * 0.016
        s.z += s.dz * 0.016
        mesh.position.set(s.x, s.y, s.z)
        const fade = Math.max(0, 1 - s.life / 1.2)
        mesh.material.opacity = fade * fade * 0.9
        const scale = 1 + fade * 3
        mesh.scale.set(scale, scale, 1)
        mesh.visible = fade > 0.01
        if (s.life > 1.2) {
          s.active = false
          s.timer = 2 + Math.random() * 15
          mesh.visible = false
        }
      }
    }
    end()
  })

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el }}
          renderOrder={-9999}
          visible={false}
        >
          <planeGeometry args={[4, 4]} />
          <spriteMaterial map={starTexture} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

function WASDControls() {
  const { camera, controls } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false })
  const _forward = useRef(new THREE.Vector3())
  const _right = useRef(new THREE.Vector3())
  const _up = useRef(new THREE.Vector3(0, 1, 0))
  const _move = useRef(new THREE.Vector3())

  useEffect(() => {
    const down = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = true; break
        case 'KeyA': keys.current.a = true; break
        case 'KeyS': keys.current.s = true; break
        case 'KeyD': keys.current.d = true; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = true; break
      }
    }
    const up = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = false; break
        case 'KeyA': keys.current.a = false; break
        case 'KeyS': keys.current.s = false; break
        case 'KeyD': keys.current.d = false; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = false; break
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useFrame((_, delta) => {
    if (!controls) return
    if (!keys.current.w && !keys.current.a && !keys.current.s && !keys.current.d) return
    const speed = (keys.current.shift ? 60 : 20) * delta
    const forward = _forward.current
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = _right.current
    right.crossVectors(forward, _up.current).normalize()
    const move = _move.current.set(0, 0, 0)
    if (keys.current.w) move.add(forward)
    if (keys.current.s) move.sub(forward)
    if (keys.current.a) move.sub(right)
    if (keys.current.d) move.add(right)
    if (move.length() === 0) return
    move.normalize().multiplyScalar(speed)
    camera.position.add(move)
    controls.target.add(move)
    controls.update()
  }, undefined, [controls])

  return null
}

function FloatingParticles({ bounds }) {
  const ref = useRef()
  
  // Dynamically determine particle count
  const particleCount = useMemo(() => {
    const pixelCount = (typeof window !== 'undefined' ? window.innerWidth * window.innerHeight * (window.devicePixelRatio || 1) : 2073600)
    const isHighRes = pixelCount > 2073600
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent)
    if (isMobile) return 150
    if (isHighRes) return 200
    return 300
  }, [])
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const spd = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = bounds.centerX + (Math.random() - 0.5) * bounds.width * 1.5
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * bounds.width * 0.5
      spd[i] = 0.2 + Math.random() * 0.5
    }
    return [pos, spd]
  }, [bounds, particleCount])

  useFrame((state) => {
    const end = perf.time('FloatingParticles')
    if (!ref.current) { end(); return }
    const t = state.clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.002
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    end()
  }, undefined, [speeds, particleCount])

  return (
    <points ref={ref} renderOrder={-10000}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#c084fc" transparent opacity={0.15} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function CameraMetrics() {
  const setCameraPos = useTimelineStore((s) => s.setCameraPos)
  const lastUpdate = useRef(0)
  useFrame(({ camera }) => {
    const now = performance.now()
    if (now - lastUpdate.current > 200) {
      lastUpdate.current = now
      setCameraPos({
        x: Math.round(camera.position.x),
        y: Math.round(camera.position.y),
        z: Math.round(camera.position.z),
      })
    }
  }, undefined, [setCameraPos])
  return null
}

function EffectComposerWrapper() {
  const bloomEnabled = useTimelineStore((s) => s.bloomEnabled)
  const { size } = useThree()
  
  // Optimize bloom based on screen resolution
  const bloomConfig = useMemo(() => {
    const pixelCount = size.width * size.height
    
    // On high-res displays, reduce blur quality
    const isHighRes = pixelCount > 2073600 // > 1440p
    
    return {
      luminanceThreshold: isHighRes ? 0.2 : 0.15,
      luminanceSmoothing: 0.9,
      intensity: 0.5,
      mipmapBlur: !isHighRes,
      blur: isHighRes ? 4 : 6,
    }
  }, [size])
  
  if (!bloomEnabled) return null
  
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={bloomConfig.luminanceThreshold}
        luminanceSmoothing={bloomConfig.luminanceSmoothing}
        intensity={bloomConfig.intensity}
        mipmapBlur={bloomConfig.mipmapBlur}
        blur={bloomConfig.blur}
      />
    </EffectComposer>
  )
}

function RenderGuard() {
  const { gl } = useThree()
  const bloomEnabled = useTimelineStore((s) => s.bloomEnabled)
  
  useFrame(() => {
    // When bloom is disabled, ensure autoClear is true to prevent trails
    if (!bloomEnabled) {
      gl.autoClear = true
    }
  }, undefined, [bloomEnabled])
  
  return null
}

function PerfMonitor() {
  const { gl } = useThree()
  useEffect(() => { perf.logWebGLInfo(gl) }, [gl])
  useFrame((_, delta) => {
    perf.detectStutter(delta * 1000)
  })
  return null
}

function SceneContent() {
  const demons = useTimelineStore((s) => s.demons)
  const selectedDemon = useTimelineStore((s) => s.selectedDemon)
  const bloomEnabled = useTimelineStore((s) => s.bloomEnabled)
  const showNebula = useTimelineStore((s) => s.renderSettings.nebula)
  const showStarfield = useTimelineStore((s) => s.renderSettings.starfield)
  const showParticles = useTimelineStore((s) => s.renderSettings.floatingParticles)
  const showShootingStars = useTimelineStore((s) => s.renderSettings.shootingStars)
  const showBlackHole = useTimelineStore((s) => s.renderSettings.blackHole)
  const showDemonGlow = useTimelineStore((s) => s.renderSettings.demonGlow)
  const showDemonRings = useTimelineStore((s) => s.renderSettings.demonRings)
  const showDemonLabels = useTimelineStore((s) => s.renderSettings.demonLabels)
  const textures = useTexture(ICON_MAP)

  const timelineBounds = useMemo(() => {
    if (demons.length === 0) return { centerX: 0, width: 400 }
    const xs = demons.map((d) => d.position[0])
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const width = Math.max(maxX - minX, 400)
    const centerX = (minX + maxX) / 2
    return { centerX, width }
  }, [demons])

  return (
    <>
      <EffectComposerWrapper />
      <RenderGuard />
      <PerfMonitor />
      
      <CameraMetrics />
      <fog attach="fog" args={['#0a0015', 80, 800]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 30]} intensity={1.5} />
      <directionalLight position={[-30, 20, 20]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#c084fc" />

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} makeDefault />
      <WASDControls />

      {showNebula && <Nebula bounds={timelineBounds} />}
      {showStarfield && <Starfield bounds={timelineBounds} />}
      {showParticles && <FloatingParticles bounds={timelineBounds} />}
      {showShootingStars && <ShootingStars bounds={timelineBounds} />}
      {showBlackHole && <BlackHole />}
      <CameraAnimator />

      <TimelineLines demons={demons} />
      {demons.map((demon) => (
        <DemonSphere key={demon.id} demon={demon} textures={textures}
          showGlow={showDemonGlow}
          showRing={showDemonRings}
          showLabel={showDemonLabels} />
      ))}

      {selectedDemon && <Tooltip demon={selectedDemon} />}
    </>
  )
}

function TimelineScene() {
  const clearSelection = useTimelineStore((s) => s.clearSelection)

  return (
    <Canvas
      camera={{ position: [0, 30, 50], fov: 50 }}
      style={{ background: '#0a0015' }}
      onPointerMissed={clearSelection}
      gl={{ preserveDrawingBuffer: true }}
    >
      <SceneContent />
    </Canvas>
  )
}

export default TimelineScene
