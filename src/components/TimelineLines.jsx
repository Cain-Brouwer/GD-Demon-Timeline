import { Line } from '@react-three/drei'

function TimelineLines({ demons }) {
  if (demons.length < 2) return null

  const points = demons.map((d) => d.position)

  return (
    <Line
      points={points}
      color="rgba(255, 255, 255, 0.25)"
      lineWidth={1}
    />
  )
}

export default TimelineLines
