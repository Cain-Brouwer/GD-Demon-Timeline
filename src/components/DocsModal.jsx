import { createPortal } from 'react-dom'

const sections = [
  {
    title: '3D Timeline',
    items: [
      'Drag to rotate the camera around the timeline.',
      'Scroll to zoom in and out.',
    ],
  },
  {
    title: 'Demon Spheres',
    items: [
      'Each demon is a sphere with its difficulty icon.',
      'Hover to highlight and see the name label.',
      'Click a sphere to open the tooltip with full details.',
      'Future demons (not yet beaten) appear greyed out with a dashed glow.',
    ],
  },
  {
    title: 'Tooltip',
    items: [
      'Shows name, creator, difficulty, and date beaten.',
      'Click "+ extra info" to see music credits and description.',
      'Use "▶ Watch Showcase" to open the YouTube video in a fullscreen modal.',
      'Use "♫ Sound Only" to play only the audio in the mini-player bar.',
    ],
  },
  {
    title: 'Watch Showcase',
    items: [
      'Opens the YouTube showcase video in a fullscreen overlay.',
      'Toggle between "Video" and "Sound Only" mode within the modal.',
      'Click outside the video or press Escape to close.',
    ],
  },
  {
    title: 'Sound Only / Mini Player',
    items: [
      'Plays the YouTube audio in a compact bar at the bottom of the screen.',
      'The 3D scene remains fully interactive while audio plays.',
      'Use the play/pause button, seek bar, and volume slider to control playback.',
      'Volume fades in smoothly when a new track starts.',
      'Click ✕ to close the mini-player.',
    ],
  },
  {
    title: 'Demon List (Right Panel)',
    items: [
      'Lists all demons sorted by ID.',
      'Click "go to" to fly the camera to that demon.',
      'Click "view all" to zoom out and see every demon at once.',
      'Click ✕ to remove a demon (you must type its name to confirm).',
    ],
  },
  {
    title: 'Add Custom Demon',
    items: [
      'Click "+ Add Custom Demon" at the bottom of the demon list.',
      'Fill in the name (required), creator, difficulty, and optional details.',
      'Set the position (ID) to insert at a specific spot in the timeline.',
      'Leave the position empty to append at the end.',
      'Choose "Future" or "Beaten" status — beaten gets today\'s date.',
    ],
  },
  {
    title: 'Remove Demon',
    items: [
      'Click the ✕ button next to any demon in the list.',
      'A confirmation dialog appears — type the demon\'s name exactly to confirm.',
      'The check is not case-sensitive.',
    ],
  },
  {
    title: 'Data Persistence',
    items: [
      'All demons and custom additions are saved in your browser (localStorage).',
      'Refreshing the page restores your timeline exactly as you left it.',
      'To reset, clear your browser data for this site.',
    ],
  },
]

function DocsModal({ onClose }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d001a',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: 24,
          fontFamily: 'monospace',
          color: 'white',
          width: 'min(520px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: '#c084fc' }}>
            Documentation
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#c084fc', marginBottom: 6 }}>
              {section.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, opacity: 0.8, lineHeight: 1.6 }}>
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>,
    document.body
  )
}

export default DocsModal
