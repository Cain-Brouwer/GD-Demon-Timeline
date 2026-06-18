import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTimelineStore } from '../store/timelineStore'

import easyIcon from '../assets/icons/Easy-Demon.png'
import mediumIcon from '../assets/icons/Medium-Demon.png'
import hardIcon from '../assets/icons/Hard-Demon.png'
import insaneIcon from '../assets/icons/Insane-Demon.png'
import extremeIcon from '../assets/icons/Extreme-Demon.png'

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

const ICON_MAP = {
  'Easy Demon': easyIcon,
  'Medium Demon': mediumIcon,
  'Hard Demon': hardIcon,
  'Insane Demon': insaneIcon,
  'Extreme Demon': extremeIcon,
}

const glowCircle = (() => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,0.25)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.08)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.02)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
})()

function DemonSphere({ demon }) {
  const spriteRef = useRef()
  const glowRef = useRef()
  const nameRef = useRef()
  const scaleRef = useRef(1)
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  const selectedDemon = useTimelineStore((s) => s.selectedDemon)
  const selectDemon = useTimelineStore((s) => s.selectDemon)
  const { camera } = useThree()
  const diffColor = DIFFICULTY_COLORS[demon.difficulty] || '#ffffff'
  const [x, , z] = demon.position
  const isSelected = selectedDemon?.id === demon.id
  const isFuture = demon.progress === 0
  const targetScale = hovered || isSelected ? 2.7 : 2
  const vec3 = useRef(new THREE.Vector3())

  const allTextures = useTexture(ICON_MAP)
  const iconTexture = allTextures[demon.difficulty]

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    vec3.current.set(x, 0, z)
    const dist = camera.position.distanceTo(vec3.current)

    if (spriteRef.current) {
      spriteRef.current.position.y = Math.sin(t * 0.8 + x) * 0.3
      spriteRef.current.visible = dist < 80
    }
    if (glowRef.current) {
      glowRef.current.position.y = Math.sin(t * 0.8 + x) * 0.3
      glowRef.current.visible = dist < 80
    }
    if (spriteRef.current) {
      scaleRef.current += (targetScale - scaleRef.current) * Math.min(delta * 6, 1)
      spriteRef.current.scale.setScalar(scaleRef.current)
      glowRef.current.scale.setScalar(scaleRef.current * 1.25)
    }
    if (nameRef.current) {
      nameRef.current.visible = dist < 40
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.008
      ringRef.current.rotation.x = 0.4 + Math.sin(t * 0.3 + x) * 0.1
      const s = 0.8 + (hovered || isSelected ? 0.4 : 0)
      ringRef.current.scale.setScalar(s)
      ringRef.current.visible = dist < 120
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    selectDemon(demon)
  }

  const colorObj = useMemo(() => new THREE.Color(diffColor), [diffColor])

  return (
    <group position={[x, 0, z]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.4, 0.04, 8, 16]} />
        <meshBasicMaterial
          color={isFuture ? '#555555' : diffColor}
          transparent
          opacity={isFuture ? 0.15 : (hovered || isSelected ? 0.5 : 0.25)}
          depthWrite={false}
        />
      </mesh>

      <sprite
        ref={glowRef}
        scale={[2.5, 2.5, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <spriteMaterial
          map={glowCircle}
          color={isFuture ? '#666666' : colorObj}
          transparent
          opacity={isFuture ? 0.1 : 0.25}
          depthWrite={false}
        />
      </sprite>

      <sprite
        ref={spriteRef}
        scale={[2, 2, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <spriteMaterial
          map={iconTexture}
          transparent
          opacity={isFuture ? 0.35 : 1}
          depthWrite={false}
        />
      </sprite>

      <Html ref={nameRef} position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
        <span
          style={{
            color: isFuture ? 'rgba(255,255,255,0.4)' : 'white',
            fontSize: hovered || isSelected ? 13 : 12,
            fontFamily: 'monospace',
            textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
            whiteSpace: 'nowrap',
            transform: 'translateY(-30px)',
            display: 'inline-block',
            transition: 'font-size 0.2s ease',
            opacity: hovered || isSelected ? 1 : 0.8,
          }}
        >
          {demon.name}
        </span>
      </Html>
    </group>
  )
}

export default DemonSphere