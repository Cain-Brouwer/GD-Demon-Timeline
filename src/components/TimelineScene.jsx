import { useEffect } from 'react'
import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF } from '@react-three/drei'
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
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,255,255,0.15)')
    g.addColorStop(0.3, 'rgba(255,255,255,0.06)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.02)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(canvas)
  }, [])

  const patches = useMemo(() => {
    const result = []
    const colors = [
      [0.4, 0.15, 0.7], [0.7, 0.2, 0.5], [0.2, 0.1, 0.6],
      [0.5, 0.1, 0.3], [0.3, 0.2, 0.7], [0.6, 0.25, 0.4],
      [0.15, 0.05, 0.5], [0.8, 0.3, 0.6], [0.25, 0.15, 0.65],
    ]
    for (let i = 0; i < 45; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)]
      result.push({
        position: [
          (Math.random() - 0.5) * 500,
          (Math.random() - 0.5) * 200 + 10,
          (Math.random() - 0.5) * 400 - 50,
        ],
        size: 30 + Math.random() * 100,
        opacity: 0.02 + Math.random() * 0.06,
        color: c,
        rotSpeed: 0.0002 + Math.random() * 0.0006,
        driftX: (Math.random() - 0.5) * 0.02,
        driftY: (Math.random() - 0.5) * 0.01,
      })
    }
    return result
  }, [])

  const refs = useRef([])
  refs.current = refs.current.slice(0, patches.length)

  useFrame(() => {
    for (let i = 0; i < patches.length; i++) {
      const mesh = refs.current[i]
      if (!mesh) continue
      const p = patches[i]
      mesh.rotation.z += p.rotSpeed
      mesh.position.x += Math.sin(Date.now() * 0.0003 + i) * 0.003
      mesh.position.y += Math.sin(Date.now() * 0.0004 + i * 1.3) * 0.002
    }
  })

  return (
    <group>
      {patches.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={p.position}
        >
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial
            map={cloudTexture}
            transparent
            depthWrite={false}
            opacity={p.opacity}
            color={p.color}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
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

function Gargantua() {
  const { scene } = useGLTF('/models/gargantua.glb')
  const ref = useRef()

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false
        }
      })
    }
  }, [scene])

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0006
    }
  })

  return <primitive ref={ref} object={scene} position={[60, -10, -80]} scale={[1.5, 1.5, 1.5]} />
}

function ShootingStars() {
  const count = 6
  const meshes = useRef([])
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
          s.x = (Math.random() - 0.5) * 400
          s.y = 100 + Math.random() * 120
          s.z = (Math.random() - 0.5) * 300 - 80
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
  })

  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshes.current[i] = el }}
          visible={false}
        >
          <planeGeometry args={[4, 4]} />
          <spriteMaterial map={starTexture} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
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

      <fog attach="fog" args={['#0a0015', 80, 400]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[30, 40, 30]} intensity={1.5} />
      <directionalLight position={[-30, 20, 20]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#c084fc" />

      <OrbitControls enableZoom enablePan enableRotate autoRotate={false} makeDefault />

      <Nebula />
      <Starfield />
      <FloatingParticles />
      <ShootingStars />
      <Gargantua />
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
