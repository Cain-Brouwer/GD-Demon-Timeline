import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'

const DIFFICULTIES = ['Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon']

function AddDemonModal({ onClose }) {
  const addDemon = useTimelineStore((s) => s.addDemon)
  const demons = useTimelineStore((s) => s.demons)

  const [name, setName] = useState('')
  const [creator, setCreator] = useState('')
  const [difficulty, setDifficulty] = useState('Easy Demon')
  const [beaten, setBeaten] = useState(false)
  const [insertId, setInsertId] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [musicArtist, setMusicArtist] = useState('')
  const [showcaseUrl, setShowcaseUrl] = useState('')
  const [description, setDescription] = useState('')

  const maxId = demons.length > 0 ? Math.max(...demons.map((d) => d.id)) : 0
  const suggestedId = maxId + 1

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const parsedId = insertId.trim() !== '' ? parseInt(insertId, 10) : undefined
    if (insertId.trim() !== '' && (isNaN(parsedId) || parsedId < 1)) return
    addDemon({
      insertId: parsedId,
      beaten,
      name: name.trim(),
      creator: creator.trim() || 'Unknown',
      difficulty,
      musicTitle: musicTitle.trim() || undefined,
      musicArtist: musicArtist.trim() || undefined,
      showcaseUrl: showcaseUrl.trim() || undefined,
      description: description.trim() || undefined,
    })
    onClose()
  }

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
          width: 'min(400px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: 16, color: '#c084fc' }}>
          Add Custom Demon
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, opacity: 0.6 }}>Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Custom Level"
            style={inputStyle}
            autoFocus
          />

          <label style={{ fontSize: 11, opacity: 0.6 }}>Creator</label>
          <input
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="e.g. CreatorName"
            style={inputStyle}
          />

          <label style={{ fontSize: 11, opacity: 0.6 }}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ ...inputStyle, color: 'white' }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} style={{ background: '#0d001a', color: 'white' }}>{d}</option>
            ))}
          </select>

          <label style={{ fontSize: 11, opacity: 0.6 }}>Position (ID)</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              min={1}
              value={insertId}
              onChange={(e) => setInsertId(e.target.value)}
              placeholder={`default: ${suggestedId} (end)`}
              style={{ ...inputStyle, flex: '1 1 100px' }}
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <span
                onClick={() => setBeaten(false)}
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: beaten ? 'rgba(255,255,255,0.08)' : '#c084fc',
                  color: beaten ? 'rgba(255,255,255,0.5)' : '#0a0015',
                  fontWeight: beaten ? 'normal' : 'bold',
                }}
              >
                Future
              </span>
              <span
                onClick={() => setBeaten(true)}
                style={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: beaten ? '#4ade80' : 'rgba(255,255,255,0.08)',
                  color: beaten ? '#0a0015' : 'rgba(255,255,255,0.5)',
                  fontWeight: beaten ? 'bold' : 'normal',
                }}
              >
                Beaten
              </span>
            </div>
          </div>
          <div style={{ fontSize: 10, opacity: 0.35, marginTop: -6 }}>
            Leave empty to append at the end. Existing demons with the same ID will shift.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6 }}>Music Title</label>
              <input
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Song name"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, opacity: 0.6 }}>Music Artist</label>
              <input
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="Artist"
                style={inputStyle}
              />
            </div>
          </div>

          <label style={{ fontSize: 11, opacity: 0.6 }}>Showcase URL (YouTube)</label>
          <input
            value={showcaseUrl}
            onChange={(e) => setShowcaseUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            style={inputStyle}
          />

          <label style={{ fontSize: 11, opacity: 0.6 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#c084fc',
                border: 'none',
                color: '#0a0015',
                padding: '6px 16px',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Add Demon
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  padding: '8px 10px',
  color: 'white',
  fontSize: 12,
  fontFamily: 'monospace',
  outline: 'none',
  width: '100%',
}

export default AddDemonModal
