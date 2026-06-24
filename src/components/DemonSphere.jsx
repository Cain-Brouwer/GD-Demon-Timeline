import { memo, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimelineStore } from '../store/timelineStore'
import { perf } from '../lib/perfDebug'

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

export const ICON_MAP = {
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

function createNameTexture(name, isFuture) {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = 'bold 24px monospace'
  const metrics = ctx.measureText(name)
  const padX = 16
  const w = Math.ceil(metrics.width + padX * 2)
  const h = 40
  ctx.canvas.width = w
  ctx.canvas.height = h
  ctx.font = 'bold 24px monospace'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.95)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 2
  ctx.fillStyle = isFuture ? 'rgba(255,255,255,0.4)' : 'white'
  ctx.fillText(name, padX, h / 2)
  const tex = new THREE.CanvasTexture(ctx.canvas)
  tex.needsUpdate = true
  return tex
}

const DemonSphere = memo(function DemonSphere({ demon, textures, showGlow, showRing, showLabel }) {
  const spriteRef = useRef()
  const glowRef = useRef()
  const nameRef = useRef()
  const scaleRef = useRef(1)
  const orderRef = useRef(null)
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
  const iconTexture = textures[demon.difficulty]

  const nameTexture = useMemo(() => createNameTexture(demon.name, isFuture), [demon.name, isFuture])
  const nameAspect = nameTexture.image.width / nameTexture.image.height
  const nameBaseScale = useMemo(() => new THREE.Vector3(nameAspect * 1.5, 1.5, 1), [nameAspect])

  useFrame((state, delta) => {
    try {
      const end = perf.time('DemonSphere')
      const t = state.clock.getElapsedTime()
      vec3.current.set(x, 0, z)
      const dist = camera.position.distanceTo(vec3.current)
      const safeDelta = Math.min(delta, 1 / 30)
      const distLevel = Math.round(-dist * 50)
      const renderOrder = distLevel * 10000 + demon.id * 10

      const screenScale = Math.max(0.3, dist / 50)
      const floatY = Math.sin(t * 0.8 + x) * 0.3
      
      if (spriteRef.current) {
        if (orderRef.current !== renderOrder) {
          spriteRef.current.renderOrder = renderOrder + 2
        }
        spriteRef.current.position.y = floatY
      }
      if (glowRef.current && showGlow) {
        if (orderRef.current !== renderOrder) {
          glowRef.current.renderOrder = renderOrder + 1
        }
        glowRef.current.position.y = floatY
      }
      if (spriteRef.current) {
        scaleRef.current += (targetScale - scaleRef.current) * Math.min(safeDelta * 6, 1)
        const s = scaleRef.current * screenScale
        spriteRef.current.scale.setScalar(s)
        if (glowRef.current && showGlow) {
          glowRef.current.scale.setScalar(s * 1.25)
        }
      }
      if (nameRef.current && showLabel) {
        if (orderRef.current !== renderOrder) {
          nameRef.current.renderOrder = renderOrder + 3
        }
        nameRef.current.position.y = floatY + 2.8 * screenScale
        nameRef.current.scale.copy(nameBaseScale).multiplyScalar(screenScale)
        nameRef.current.visible = dist < 50
      }
      if (ringRef.current && showRing) {
        if (orderRef.current !== renderOrder) {
          ringRef.current.renderOrder = renderOrder + 4
        }
        ringRef.current.rotation.z += 0.008 * (safeDelta / (1 / 60))
        ringRef.current.rotation.x = 0.4 + Math.sin(t * 0.3 + x) * 0.1
        const s = 0.8 + (hovered || isSelected ? 0.4 : 0)
        ringRef.current.scale.setScalar(s)
        ringRef.current.visible = dist < 120
      }
      orderRef.current = renderOrder
      end()
    } catch (e) { console.warn('[useFrame DemonSphere]', e) }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    selectDemon(demon)
  }

  const colorObj = useMemo(() => new THREE.Color(diffColor), [diffColor])

  return (
    <group position={[x, 0, z]}>
      {showRing && (
        <mesh ref={ringRef} renderOrder={0}>
          <torusGeometry args={[1.4, 0.04, 8, 16]} />
          <meshBasicMaterial
            color={isFuture ? '#555555' : diffColor}
            transparent
            opacity={isFuture ? 0.15 : (hovered || isSelected ? 0.5 : 0.25)}
            depthWrite={false}
          />
        </mesh>
      )}

      {showGlow && (
        <sprite
          ref={glowRef}
          renderOrder={0}
          frustumCulled={false}
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
            depthTest={false}
            depthWrite={false}
          />
        </sprite>
      )}

      <sprite
        ref={spriteRef}
        renderOrder={0}
        frustumCulled={false}
        scale={[2, 2, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <spriteMaterial
          map={iconTexture}
          transparent
          opacity={isFuture ? 0.35 : 1}
          depthTest={false}
          depthWrite={false}
        />
      </sprite>

      {showLabel && (
        <sprite ref={nameRef} renderOrder={0} frustumCulled={false} scale={[nameAspect * 1.5, 1.5, 1]}>
          <spriteMaterial
            map={nameTexture}
            transparent
            depthTest={false}
            depthWrite={false}
          />
        </sprite>
      )}
    </group>
  )
})

export default DemonSphere