import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { perf } from '../lib/perfDebug'

const _tlPoint = new THREE.Vector3()

function createVaryingTube(curve, segments, radialSegments, radiusFn) {
  const vertices = []
  const indices = []
  const normals = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const pt = curve.getPoint(t)
    const tangent = curve.getTangent(t)
    const r = radiusFn(t)

    const up = new THREE.Vector3(0, 1, 0)
    if (Math.abs(tangent.dot(up)) > 0.99) up.set(1, 0, 0)
    const axis = new THREE.Vector3().crossVectors(tangent, up).normalize()
    const angle0 = new THREE.Vector3().crossVectors(tangent, axis).normalize()

    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)

      const local = new THREE.Vector3()
        .addScaledVector(angle0, x)
        .addScaledVector(axis, y)

      vertices.push(pt.x + local.x, pt.y + local.y, pt.z + local.z)
      normals.push(local.x, local.y, local.z)
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j
      const b = a + radialSegments + 1
      indices.push(a, b, a + 1)
      indices.push(b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setIndex(indices)
  return geo
}

function TimelineLines({ demons }) {
  const partRef = useRef()
  const groupRef = useRef()
  const posRef = useRef(null)
  const { camera } = useThree()

  const curve = useMemo(() => {
    if (demons.length < 2) return null
    const pts = demons.map((d) => new THREE.Vector3(d.position[0], d.position[1] || 0, d.position[2] || 0))
    return new THREE.CatmullRomCurve3(pts)
  }, [demons])

  const glowGeo = useMemo(() => {
    if (!curve) return null
    return createVaryingTube(curve, 80, 6, (t) => 0.3 + Math.sin(t * Math.PI * 6) * 0.12 * Math.sin(t * Math.PI))
  }, [curve])

  const coreGeo = useMemo(() => {
    if (!curve) return null
    return createVaryingTube(curve, 80, 6, (t) => 0.08 + Math.sin(t * Math.PI * 8 + 1) * 0.04 * Math.sin(t * Math.PI))
  }, [curve])

  const pCount = 50
  const initPos = useMemo(() => {
    if (!curve) return null
    const arr = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const t = i / pCount
      const pt = curve.getPoint(t)
      arr[i * 3] = pt.x
      arr[i * 3 + 1] = pt.y
      arr[i * 3 + 2] = pt.z
    }
    posRef.current = arr
    return arr
  }, [curve])

  useFrame((state) => {
    try {
      const end = perf.time('TimelineLines')
      if (!partRef.current || !curve) return
      if (!partRef.current.geometry?.attributes?.position?.array) return
      const time = state.clock.getElapsedTime() * 0.3
      const pos = partRef.current.geometry.attributes.position.array
      for (let i = 0; i < pCount; i++) {
        const t = ((i / pCount) + time) % 1
        curve.getPoint(t, _tlPoint)
        pos[i * 3] = _tlPoint.x
        pos[i * 3 + 1] = _tlPoint.y
        pos[i * 3 + 2] = _tlPoint.z
      }
      partRef.current.geometry.attributes.position.needsUpdate = true

      if (groupRef.current && demons.length > 0) {
        let sumX = 0, sumY = 0, sumZ = 0
        for (let i = 0; i < demons.length; i++) {
          sumX += demons[i].position[0]
          sumY += demons[i].position[1] || 0
          sumZ += demons[i].position[2] || 0
        }
        _tlPoint.set(sumX / demons.length, sumY / demons.length, sumZ / demons.length)
        const dist = camera.position.distanceTo(_tlPoint)
        const tlOrder = Math.round(-dist * 50) * 10000 - 500
        groupRef.current.children.forEach((child, i) => {
          child.renderOrder = tlOrder + i
        })
      }

      end()
    } catch (e) { console.warn('[useFrame TimelineLines]', e) }
  })

  if (!curve || demons.length < 2) return null

  return (
    <group ref={groupRef}>
      <mesh geometry={glowGeo}>
        <meshBasicMaterial color="white" transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={coreGeo}>
        <meshBasicMaterial color="white" transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={coreGeo}>
        <meshBasicMaterial color="#c084fc" transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <points ref={partRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={pCount} array={initPos} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.5} color="white" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

export default TimelineLines
