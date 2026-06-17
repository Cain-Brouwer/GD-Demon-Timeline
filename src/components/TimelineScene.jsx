import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTimelineStore } from '../store/timelineStore'
import DemonSphere from './DemonSphere'
import TimelineLines from './TimelineLines'

function getYouTubeId(url) {
  try {
    const params = new URLSearchParams(new URL(url).search)
    return params.get('v')
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
      </div>
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
  const positions = useMemo(() => {
    const count = 2500
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 600
      arr[i * 3 + 1] = (Math.random() - 0.5) * 300
      arr[i * 3 + 2] = (Math.random() - 0.5) * 600 - 150
    }
    return arr
  }, [])

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.00015
    }
  })

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2500} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.35} color="white" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
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
      <fog attach="fog" args={['#0a0015', 60, 220]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 30]} intensity={1.5} />
      <directionalLight position={[-30, 20, 20]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#c084fc" />

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} makeDefault />

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
    >
      <SceneContent />
    </Canvas>
  )
}

export default TimelineScene
