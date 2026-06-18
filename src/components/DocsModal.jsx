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
    title: 'Keyboard Shortcuts',
    items: [
      '←/↑ or →/↓ — Select previous/next demon.',
      'Esc — Close tooltip, modal, or YouTube player.',
      'Ctrl+F — Focus the search box.',
    ],
  },
  {
    title: 'Demon Spheres',
    items: [
      'Each demon is a sphere with its difficulty icon.',
      'Spheres smoothly scale up on hover or when selected.',
      'Click a sphere to open the tooltip with full details.',
      'Future demons appear greyed out with a dashed border.',
    ],
  },
  {
    title: 'Tooltip',
    items: [
      'Shows name, creator, difficulty, and date beaten.',
      'Click "+ extra info" to see music credits and description.',
      'Use "▶ Watch Showcase" to open the YouTube video.',
      'Use "♫ Sound Only" to play only the audio.',
    ],
  },
  {
    title: 'Watch Showcase',
    items: [
      'Opens the YouTube video in a fullscreen overlay.',
      'Toggle between "Video" and "Sound Only" mode.',
      'Click outside or press Escape to close.',
    ],
  },
  {
    title: 'Sound Only / Mini Player',
    items: [
      'Plays YouTube audio in a compact bar at the bottom.',
      'The 3D scene remains fully interactive.',
      'Play/pause, seek bar, and volume slider controls.',
      'Volume fades in smoothly on new tracks.',
    ],
  },
  {
    title: 'Demon List & Search',
    items: [
      'The right panel lists all demons with difficulty dots.',
      'Use the search box (or Ctrl+F) to find demons by name, creator, or description.',
      'Filter by difficulty (Easy/Medium/Hard/Insane/Extreme) or status (beaten/future).',
      'Click the sort label to cycle through sort orders (ID, name, difficulty, date).',
      'Click "go to" to fly the camera to that demon.',
      'Click "view all" to zoom out and see every demon.',
    ],
  },
  {
    title: 'Add / Edit / Remove',
    items: [
      'Click "+ Add Custom Demon" to add a new demon.',
      'Use the "✎ Edit" button in any tooltip to edit a demon.',
      'Click ✕ to remove a demon (type the name to confirm).',
      'Set position ID to insert at a specific spot.',
    ],
  },
  {
    title: 'Statistics',
    items: [
      'Click "stats" in the demon list header to open the dashboard.',
      'Shows total, beaten, future counts and completion percentage.',
      'Per-difficulty progress bars with color coding.',
      'Daily streak tracker and recent beaten list.',
    ],
  },
  {
    title: 'Import / Export',
    items: [
      'Click "⇄" to open the import/export dialog.',
      'Export your timeline as a downloadable JSON file.',
      'Import a JSON file to replace your current timeline.',
    ],
  },
  {
    title: 'Screenshot',
    items: [
      'Click "screenshot" in the bottom bar to capture the current 3D view.',
      'Downloads a PNG image of the timeline.',
    ],
  },
  {
    title: 'Cloud Sync',
    items: [
      'Sign in with an email and password to sync your timeline to the cloud.',
      'Use the "save" / "load" buttons to manually sync.',
      'Auto-syncs when you sign in.',
    ],
  },
  {
    title: 'Data Persistence',
    items: [
      'All demons are saved in your browser (localStorage).',
      'Refreshing restores your timeline exactly as it was.',
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
