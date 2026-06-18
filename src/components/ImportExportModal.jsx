import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

function ImportExportModal({ demons, onImport, onClose }) {
  const [view, setView] = useState('export')

  const exportJson = JSON.stringify(demons, null, 2)
  const blob = new Blob([exportJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

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
          width: 'min(440px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: '#c084fc' }}>
            {view === 'export' ? 'Export Demons' : 'Import Demons'}
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

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span
            onClick={() => setView('export')}
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              padding: '4px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              background: view === 'export' ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
              color: view === 'export' ? '#c084fc' : 'rgba(255,255,255,0.5)',
              fontWeight: view === 'export' ? 'bold' : 'normal',
            }}
          >
            Export
          </span>
          <span
            onClick={() => setView('import')}
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              padding: '4px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              background: view === 'import' ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
              color: view === 'import' ? '#c084fc' : 'rgba(255,255,255,0.5)',
              fontWeight: view === 'import' ? 'bold' : 'normal',
            }}
          >
            Import
          </span>
        </div>

        {view === 'export' ? (
          <>
            <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>
              Your timeline data as JSON ({demons.length} demons):
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 6,
              padding: 10,
              maxHeight: 200,
              overflow: 'auto',
              fontSize: 10,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 12,
            }}>
              {exportJson.slice(0, 1000)}{exportJson.length > 1000 ? '...' : ''}
            </div>
            <a
              href={url}
              download="gd-demon-timeline-export.json"
              style={{
                display: 'block',
                textAlign: 'center',
                background: '#c084fc',
                border: 'none',
                borderRadius: 6,
                padding: '10px 16px',
                color: '#0a0015',
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              onClick={() => setTimeout(() => URL.revokeObjectURL(url), 10000)}
            >
              ⬇ Download JSON
            </a>
          </>
        ) : (
          <ImportTab demons={demons} onImport={onImport} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body
  )
}

function ImportTab({ demons, onImport, onClose }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    setError('')
    setPreview(null)
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) throw new Error('Root must be an array of demons.')
        for (const d of data) {
          if (!d.name || !d.difficulty) throw new Error(`Demon "${d.name || 'unknown'}" missing name or difficulty.`)
        }
        setPreview(data)
      } catch (err) {
        setError(`Invalid file: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    if (!preview) return
    onImport(preview)
    onClose()
  }

  return (
    <>
      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8 }}>
        Upload a JSON file with an array of demon objects.
        {demons.length > 0 && (
          <span style={{ display: 'block', marginTop: 4, color: '#ffcc00', opacity: 0.8 }}>
            This will <strong>replace</strong> your current {demons.length} demon(s).
          </span>
        )}
      </div>

      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: 6,
          padding: '20px 16px',
          color: 'white',
          fontSize: 12,
          fontFamily: 'monospace',
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        {preview ? `✓ ${preview.length} demons loaded` : '📁 Click to select JSON file'}
      </button>

      {error && (
        <div style={{ fontSize: 11, color: '#ff6b6b', marginBottom: 8, padding: '6px 8px', background: 'rgba(255,107,107,0.08)', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {preview && (
        <button
          onClick={handleImport}
          style={{
            width: '100%',
            background: '#4ade80',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            color: '#0a0015',
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Import {preview.length} Demon{preview.length !== 1 ? 's' : ''}
        </button>
      )}
    </>
  )
}

export default ImportExportModal
