import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
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

function DemonSphere({ demon }) {
  const floatRef = useRef()
  const [hovered, setHovered] = useState(false)
  const selectedDemon = useTimelineStore((s) => s.selectedDemon)
  const selectDemon = useTimelineStore((s) => s.selectDemon)
  const diffColor = DIFFICULTY_COLORS[demon.difficulty] || '#ffffff'
  const [x, , z] = demon.position
  const isSelected = selectedDemon?.id === demon.id
  const iconSrc = ICON_MAP[demon.difficulty] || easyIcon
  const isFuture = demon.progress === 0
  const size = hovered || isSelected ? 80 : 60

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(t * 0.8 + x) * 0.3
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    selectDemon(demon)
  }

  return (
    <group position={[x, 0, z]}>
      <group ref={floatRef}>
        <Html position={[0, 0, 0]} center zIndexRange={[0, 0]}>
          <div
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: size,
              height: size,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: isFuture
                  ? `radial-gradient(circle, rgba(100,100,100,0.3) 0%, rgba(100,100,100,0.15) 50%, transparent 70%)`
                  : `radial-gradient(circle, ${diffColor}44 0%, ${diffColor}22 50%, transparent 70%)`,
                border: isFuture ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                pointerEvents: 'none',
              }}
            />
            <img
              src={iconSrc}
              alt={demon.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'auto',
                opacity: isFuture ? 0.4 : 1,
                filter: isFuture ? 'grayscale(0.6)' : 'none',
              }}
            />
            {isFuture && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 4,
                  padding: '1px 4px',
                  fontSize: 8,
                  fontFamily: 'monospace',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: '12px',
                  pointerEvents: 'none',
                }}
              >
                future
              </span>
            )}
          </div>
        </Html>

        <Html
          position={[0, 0, 0]}
          center
          zIndexRange={[0, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span
            style={{
              color: isFuture ? 'rgba(255,255,255,0.4)' : 'white',
              fontSize: 12,
              fontFamily: 'monospace',
              textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
              whiteSpace: 'nowrap',
              transform: 'translateY(-30px)',
              display: 'inline-block',
            }}
          >
            {demon.name}
          </span>
        </Html>
      </group>
    </group>
  )
}

export default DemonSphere
