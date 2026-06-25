import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'
import { searchGdLevels, mapGdLevelToDemon } from '../lib/gdApi'

const DIFFICULTIES = ['Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon']

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

function AddDemonModal({ onClose }) {
  const addDemon = useTimelineStore((s) => s.addDemon)
  const demons = useTimelineStore((s) => s.demons)

  const [mode, setMode] = useState('custom')
  const [name, setName] = useState('')
  const [creator, setCreator] = useState('')
  const [difficulty, setDifficulty] = useState('Easy Demon')
  const [beaten, setBeaten] = useState(false)
  const [insertId, setInsertId] = useState('')
  const [musicTitle, setMusicTitle] = useState('')
  const [musicArtist, setMusicArtist] = useState('')
  const [showcaseUrl, setShowcaseUrl] = useState('')
  const [description, setDescription] = useState('')
  const [dateBeaten, setDateBeaten] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchTotal, setSearchTotal] = useState(0)
  const debounceRef = useRef(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const maxId = demons.length > 0 ? Math.max(...demons.map((d) => d.id)) : 0
  const suggestedId = maxId + 1

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!searchQuery.trim()) { setSearchResults([]); setSearchTotal(0); setSearchError(null); return }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      setSearchError(null)
      try {
        const data = await searchGdLevels(searchQuery.trim())
        setSearchResults(data.levels || [])
        setSearchTotal(data.total || 0)
      } catch (e) {
        setSearchError(e.message)
        setSearchResults([])
      }
      setSearchLoading(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  const handleSelectFromList = (result) => {
    setName(result.name)
    setCreator(result.creator || '')
    setDifficulty(result.difficulty)
    setDescription(result.description || '')
    setMode('custom')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const parsedId = insertId.trim() !== '' ? parseInt(insertId, 10) : undefined
    if (insertId.trim() !== '' && (isNaN(parsedId) || parsedId < 1)) return
    addDemon({
      insertId: parsedId,
      beaten,
      dateBeaten: beaten ? (dateBeaten || todayStr) : undefined,
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
          width: 'min(440px, 92vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: 16, color: '#c084fc' }}>
          Add Demon
        </h2>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <span
            onClick={() => setMode('custom')}
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              padding: '5px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              background: mode === 'custom' ? '#c084fc' : 'rgba(255,255,255,0.06)',
              color: mode === 'custom' ? '#0a0015' : 'rgba(255,255,255,0.5)',
              fontWeight: mode === 'custom' ? 'bold' : 'normal',
              border: `1px solid ${mode === 'custom' ? '#c084fc' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            Custom
          </span>
          <span
            onClick={() => setMode('browse')}
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              padding: '5px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              background: mode === 'browse' ? '#4a9eff' : 'rgba(255,255,255,0.06)',
              color: mode === 'browse' ? 'white' : 'rgba(255,255,255,0.5)',
              fontWeight: mode === 'browse' ? 'bold' : 'normal',
              border: `1px solid ${mode === 'browse' ? '#4a9eff' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            Search GD
          </span>
        </div>

        {mode === 'browse' ? (
          <div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Geometry Dash levels..."
              style={inputStyle}
              autoFocus
            />
            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4, marginBottom: 8 }}>
              {searchLoading ? 'Searching...' : searchQuery.trim() ? `Found ${searchTotal} levels` : 'Type a level name to search'}
            </div>
            {searchError && (
              <div style={{ fontSize: 12, color: '#ff6b6b', textAlign: 'center', padding: 12 }}>
                {searchError}
              </div>
            )}
            {searchLoading && (
              <div style={{ fontSize: 12, textAlign: 'center', padding: 20, opacity: 0.5 }}>
                Loading...
              </div>
            )}
            {!searchLoading && !searchError && searchResults.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {searchResults.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleSelectFromList(d)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    <div style={{
                      width: 4, height: 32, borderRadius: 2, flexShrink: 0,
                      background: DIFFICULTY_COLORS[d.difficulty] || '#333',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>
                        by {d.creator} · {d.stars}★ · {d.downloads.toLocaleString()} downloads
                      </div>
                    </div>
                    <div style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: DIFFICULTY_COLORS[d.difficulty] + '33',
                      color: DIFFICULTY_COLORS[d.difficulty],
                      flexShrink: 0,
                    }}>
                      {d.difficulty.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 11, opacity: 0.6 }}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Custom Level"
              style={inputStyle}
              autoFocus={mode === 'custom'}
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
                  onClick={() => { setBeaten(false); setDateBeaten('') }}
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
                  onClick={() => { setBeaten(true); if (!dateBeaten) setDateBeaten(todayStr) }}
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
                {beaten && (
                  <input
                    type="date"
                    value={dateBeaten}
                    onChange={(e) => setDateBeaten(e.target.value)}
                    style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                  />
                )}
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
        )}
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
  boxSizing: 'border-box',
}

export default AddDemonModal
