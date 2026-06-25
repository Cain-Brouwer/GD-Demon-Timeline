import { useTimelineStore } from '../store/timelineStore'

export default function TransitionOverlay() {
  const sceneTransitioning = useTimelineStore((s) => s.sceneTransitioning)

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.92)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'monospace',
      color: 'white',
      transition: 'opacity 0.25s ease',
      opacity: sceneTransitioning ? 1 : 0,
      pointerEvents: sceneTransitioning ? 'auto' : 'none',
    }}>
      <div style={{
        width: 48, height: 48,
        border: '3px solid rgba(192, 132, 252, 0.2)',
        borderTop: '3px solid #c084fc',
        borderRadius: '50%',
        animation: 'tl-spin 1s linear infinite',
        marginBottom: 16,
      }} />
      <style>{`@keyframes tl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
