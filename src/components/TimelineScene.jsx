import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useTimelineStore } from '../store/timelineStore'
import EditDemonModal from './EditDemonModal'
import DemonSphere from './DemonSphere'
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
  })

  return null
}

function Starfield() {
  const starsRef = useRef()
  const { positions, colors, sizes, phases } = useMemo(() => {
    const count = 3000
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const pha = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 800
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400
      pos[i * 3 + 2] = (Math.random() - 0.5) * 800 - 200

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
      pha[i] = Math.random() * Math.PI * 2
    }
    return { positions: pos, colors: col, sizes: siz, phases: pha }
  }, [])

  const sizeAttr = useMemo(() => {
    const arr = new Float32Array(3000)
    for (let i = 0; i < 3000; i++) arr[i] = sizes[i]
    return arr
  }, [sizes])

  useFrame(({ clock }) => {
    if (!starsRef.current) return
    starsRef.current.rotation.y += 0.00012
    const t = clock.getElapsedTime()
    const siz = starsRef.current.geometry.attributes.size.array
    for (let i = 0; i < 3000; i++) {
      siz[i] = sizes[i] * (0.5 + 0.5 * Math.sin(t * 0.5 + phases[i]))
    }
    starsRef.current.geometry.attributes.size.needsUpdate = true
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={3000} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={3000} array={sizeAttr} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.35} vertexColors transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Nebula() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512)
    gradient.addColorStop(0, 'rgba(120, 50, 200, 0.15)')
    gradient.addColorStop(0.2, 'rgba(80, 30, 160, 0.1)')
    gradient.addColorStop(0.4, 'rgba(200, 50, 150, 0.06)')
    gradient.addColorStop(0.6, 'rgba(50, 30, 120, 0.04)')
    gradient.addColorStop(1, 'rgba(10, 0, 21, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 512)

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 512
      const r = 60 + Math.random() * 200
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${80 + Math.random() * 80}, ${30 + Math.random() * 50}, ${120 + Math.random() * 80}, 0.04)`)
      g.addColorStop(1, 'rgba(10, 0, 21, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  const ref = useRef()
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0003
      ref.current.rotation.x = Math.sin(Date.now() * 0.00005) * 0.02
    }
  })

  return (
    <mesh ref={ref} position={[0, -20, -120]}>
      <planeGeometry args={[300, 200]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function FloatingParticles() {
  const ref = useRef()
  const count = 300
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 300
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200
      spd[i] = 0.2 + Math.random() * 0.5
    }
    return [pos, spd]
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.002
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#c084fc" transparent opacity={0.15} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function SceneContent() {
  const demons = useTimelineStore((s) => s.demons)
  const selectedDemon = useTimelineStore((s) => s.selectedDemon)

  return (
    <>
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur />
      </EffectComposer>

      <fog attach="fog" args={['#0a0015', 60, 220]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 30]} intensity={1.5} />
      <directionalLight position={[-30, 20, 20]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#c084fc" />

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} makeDefault />

      <Nebula />
      <Starfield />
      <FloatingParticles />
      <CameraAnimator />

      <TimelineLines demons={demons} />
      {demons.map((demon) => (
        <DemonSphere key={demon.id} demon={demon} />
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
