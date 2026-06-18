import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'

const DIFFICULTIES = ['Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon']

function EditDemonModal({ demon, onClose }) {
  const editDemon = useTimelineStore((s) => s.editDemon)

  const [name, setName] = useState(demon.name || '')
  const [creator, setCreator] = useState(demon.creator || '')
  const [difficulty, setDifficulty] = useState(demon.difficulty || 'Easy Demon')
  const [musicTitle, setMusicTitle] = useState(demon.musicTitle || '')
  const [musicArtist, setMusicArtist] = useState(demon.musicArtist || '')
  const [showcaseUrl, setShowcaseUrl] = useState(demon.showcaseUrl || '')
  const [description, setDescription] = useState(demon.description || '')
  const [progress, setProgress] = useState(demon.progress ?? 0)
  const [dateBeaten, setDateBeaten] = useState(demon.dateBeaten || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    editDemon(demon.id, {
      name: name.trim(),
      creator: creator.trim() || 'Unknown',
      difficulty,
      musicTitle: musicTitle.trim() || undefined,
      musicArtist: musicArtist.trim() || undefined,
      showcaseUrl: showcaseUrl.trim() || undefined,
      description: description.trim() || undefined,
      progress: progress,
      dateBeaten: progress === 100 ? (dateBeaten || new Date().toISOString().split('T')[0]) : 'N/A',
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
        <h2 style={{ margin: '0 0 4px', fontSize: 16, color: '#c084fc' }}>
          Edit Demon
        </h2>
        <div style={{ fontSize: 11, opacity: 0.4, marginBottom: 16 }}>
          #{demon.id} — {demon.name}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, opacity: 0.6 }}>Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            autoFocus
          />

          <label style={{ fontSize: 11, opacity: 0.6 }}>Creator</label>
          <input
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
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

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              onClick={() => { setProgress(0); setDateBeaten('N/A') }}
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                background: progress === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.08)',
                color: progress === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.5)',
                border: progress === 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              }}
            >
              Future
            </span>
            <span
              onClick={() => { setProgress(100); if (!dateBeaten || dateBeaten === 'N/A') setDateBeaten(new Date().toISOString().split('T')[0]) }}
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                padding: '4px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                background: progress === 100 ? '#4ade80' : 'rgba(255,255,255,0.08)',
                color: progress === 100 ? '#0a0015' : 'rgba(255,255,255,0.5)',
                fontWeight: progress === 100 ? 'bold' : 'normal',
              }}
            >
              Beaten
            </span>
            {progress === 100 && (
              <input
                type="date"
                value={dateBeaten}
                onChange={(e) => setDateBeaten(e.target.value)}
                style={{ ...inputStyle, flex: 1, fontSize: 11 }}
              />
            )}
          </div>

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
              Save
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

export default EditDemonModal
