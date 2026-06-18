import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'
import AddDemonModal from './AddDemonModal'
import DocsModal from './DocsModal'
import AuthModal from './AuthModal'
import StatsModal from './StatsModal'
import ImportExportModal from './ImportExportModal'

const DIFFICULTY_COLORS = {
  'Easy Demon': '#00ff00',
  'Medium Demon': '#ffff00',
  'Hard Demon': '#ff6600',
  'Insane Demon': '#ff0000',
  'Extreme Demon': '#ff00ff',
}

function useMedia(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

function UIOverlay({ config }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [showMobileList, setShowMobileList] = useState(false)
  const isMobile = useMedia('(max-width: 768px)')
  const [showLeftDetail, setShowLeftDetail] = useState(!isMobile)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [removeInput, setRemoveInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const demons = useTimelineStore((s) => s.demons)
  const user = useTimelineStore((s) => s.user)
  const cloudStatus = useTimelineStore((s) => s.cloudStatus)
  const cloudSave = useTimelineStore((s) => s.cloudSave)
  const cloudLoad = useTimelineStore((s) => s.cloudLoad)
  const signOut = useTimelineStore((s) => s.signOut)
  const setGoToPosition = useTimelineStore((s) => s.setGoToPosition)
  const removeDemon = useTimelineStore((s) => s.removeDemon)
  const replaceAllDemons = useTimelineStore((s) => s.replaceAllDemons)
  const triggerViewAll = useTimelineStore((s) => s.triggerViewAll)
  const searchRef = useRef(null)
  const [flash, setFlash] = useState(false)

  const takeScreenshot = () => {
    import('html2canvas').then(({ default: html2canvas }) => {
      const el = document.querySelector('.app')
      if (!el) return
      html2canvas(el, {
        backgroundColor: '#0a0015',
        useCORS: true,
        scale: 1,
        onclone: (doc) => {
          doc.body.querySelectorAll('[style*="z-index: 9999"], [style*="z-index: 10000"], [style*="z-index: 10001"], [style*="z-index: 10002"]')
            .forEach((el) => el.remove())
        },
      }).then((canvas) => {
        const link = document.createElement('a')
        link.download = `gd-timeline-${new Date().toISOString().split('T')[0]}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setFlash(true)
        setTimeout(() => setFlash(false), 600)
      })
    })
  }

  useEffect(() => {
    const handler = () => searchRef.current?.focus()
    window.addEventListener('focus-search', handler)
    return () => window.removeEventListener('focus-search', handler)
  }, [])

  const filteredDemons = useMemo(() => {
    let list = [...demons]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        (d.creator || '').toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
      )
    }

    if (filterDifficulty !== 'all') {
      list = list.filter((d) => d.difficulty === filterDifficulty)
    }

    if (filterStatus === 'beaten') {
      list = list.filter((d) => d.progress === 100)
    } else if (filterStatus === 'future') {
      list = list.filter((d) => d.progress === 0)
    }

    list.sort((a, b) => {
      const order = ['Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon']
      let cmp
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortBy === 'difficulty') cmp = order.indexOf(a.difficulty) - order.indexOf(b.difficulty)
      else if (sortBy === 'date') cmp = a.dateBeaten.localeCompare(b.dateBeaten)
      else cmp = a.id - b.id
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [demons, searchQuery, filterDifficulty, filterStatus, sortBy, sortDir])

  return createPortal(
    <>
      {flash && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 99999,
            opacity: 0.15,
            pointerEvents: 'none',
            animation: 'flashOut 0.6s ease-out',
          }}
        />
      )}
      <style>{`@keyframes flashOut { from { opacity: 0.3 } to { opacity: 0 } }`}</style>
      {showAddModal && <AddDemonModal onClose={() => setShowAddModal(false)} />}
      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showStats && <StatsModal demons={demons} onClose={() => setShowStats(false)} />}
      {showImportExport && (
        <ImportExportModal
          demons={demons}
          onImport={(data) => replaceAllDemons(data)}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {isMobile && (
        <button
          onClick={() => setShowMobileList((v) => !v)}
          style={{
            position: 'fixed',
            bottom: showMobileList ? 'auto' : 60,
            top: showMobileList ? 10 : 'auto',
            right: 10,
            zIndex: 10010,
            background: showMobileList ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: 'white',
            fontSize: 18,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'monospace',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {showMobileList ? '✕' : '☰'}
        </button>
      )}

      {confirmRemove && (
        <div
          onClick={() => { setConfirmRemove(null); setRemoveInput('') }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
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
              width: 'min(360px, 88vw)',
            }}
          >
            <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 'bold', marginBottom: 12, color: '#ff6b6b' }}>
              Remove Demon
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
              Type "<strong>{confirmRemove.name}</strong>" to confirm removal:
            </div>
            <input
              value={removeInput}
              onChange={(e) => setRemoveInput(e.target.value)}
              placeholder="Enter demon name..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6,
                padding: '8px 10px',
                color: 'white',
                fontSize: 12,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && removeInput.toLowerCase() === confirmRemove.name.toLowerCase()) {
                  removeDemon(confirmRemove.id)
                  setConfirmRemove(null)
                  setRemoveInput('')
                }
                if (e.key === 'Escape') {
                  setConfirmRemove(null)
                  setRemoveInput('')
                }
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={() => { setConfirmRemove(null); setRemoveInput('') }}
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
                onClick={() => {
                  removeDemon(confirmRemove.id)
                  setConfirmRemove(null)
                  setRemoveInput('')
                }}
                disabled={removeInput.toLowerCase() !== confirmRemove.name.toLowerCase()}
                style={{
                  background: removeInput.toLowerCase() === confirmRemove.name.toLowerCase() ? '#ff6b6b' : 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: removeInput.toLowerCase() === confirmRemove.name.toLowerCase() ? '#0a0015' : 'rgba(255,255,255,0.3)',
                  padding: '6px 16px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  cursor: removeInput.toLowerCase() === confirmRemove.name.toLowerCase() ? 'pointer' : 'not-allowed',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 10 : 20,
          left: isMobile ? 10 : 20,
          right: isMobile ? 10 : 'auto',
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: isMobile ? '10px 14px' : '16px 20px',
          borderRadius: 12,
          fontFamily: 'monospace',
          zIndex: 9999,
          minWidth: isMobile ? 0 : 200,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h1
          onClick={() => setShowLeftDetail((v) => !v)}
          style={{
            fontSize: isMobile ? 13 : 18,
            margin: '0 0 4px',
            color: '#c084fc',
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {config.title} {showLeftDetail ? '▼' : '▶'}
          <span style={{ fontSize: 9, background: 'rgba(192,132,252,0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: 4 }}>v2.0</span>
        </h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <p style={{ margin: 0, fontSize: isMobile ? 11 : 14, opacity: 0.8 }}>
            Total: {demons.length}
          </p>
          <p style={{ margin: 0, fontSize: isMobile ? 10 : 12, opacity: 0.6 }}>
            <span style={{ color: '#4ade80' }}>{demons.filter((d) => d.progress === 100).length} beaten</span>
            {' · '}
            <span style={{ color: '#888' }}>{demons.filter((d) => d.progress === 0).length} future</span>
          </p>
        </div>
        {showLeftDetail && (
          <>
            <div style={{ marginTop: 4, fontSize: 11, opacity: 0.5, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(DIFFICULTY_COLORS).map(([diff]) => {
                const total = demons.filter((d) => d.difficulty === diff).length
                const beaten = demons.filter((d) => d.difficulty === diff && d.progress === 100).length
                return total > 0 ? (
                  <span key={diff}>{diff.split(' ')[0]} {beaten}/{total}</span>
                ) : null
              })}
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              {Object.entries(DIFFICULTY_COLORS).map(([diff, color]) => (
                <div
                  key={diff}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block',
                      boxShadow: `0 0 6px ${color}`,
                    }}
                  />
                  {diff}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          display: isMobile && !showMobileList ? 'none' : 'block',
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? 'auto' : 20,
          bottom: isMobile ? 55 : 'auto',
          right: isMobile ? 10 : 20,
          left: isMobile ? 10 : 'auto',
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: isMobile ? '8px 10px' : '12px 16px',
          borderRadius: 12,
          fontFamily: 'monospace',
          zIndex: 9999,
          minWidth: isMobile ? 0 : 220,
          overflowY: 'auto',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: isMobile ? '40vh' : 'calc(100vh - 100px)',
        }}
      >
        <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 'bold', marginBottom: 6, color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Demon List</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {user ? (
              <>
                <button
                  onClick={cloudSave}
                  disabled={cloudStatus === 'saving'}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: cloudStatus === 'saved' ? '#4ade80' : 'rgba(255,255,255,0.6)',
                    padding: isMobile ? '4px 8px' : '2px 6px',
                    borderRadius: 4,
                    fontSize: isMobile ? 11 : 9,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                  title={cloudStatus === 'saved' ? 'Saved' : 'Save to cloud'}
                >
                  {cloudStatus === 'saving' ? '...' : cloudStatus === 'saved' ? 'saved' : 'save'}
                </button>
                <button
                  onClick={cloudLoad}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.6)',
                    padding: isMobile ? '4px 8px' : '2px 6px',
                    borderRadius: 4,
                    fontSize: isMobile ? 11 : 9,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                  title="Load from cloud"
                >
                  load
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  background: 'rgba(192,132,252,0.15)',
                  border: '1px solid rgba(192,132,252,0.3)',
                  color: '#c084fc',
                  padding: isMobile ? '4px 8px' : '2px 6px',
                  borderRadius: 4,
                  fontSize: isMobile ? 11 : 9,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                sign in
              </button>
            )}
            <button
              onClick={triggerViewAll}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                padding: isMobile ? '4px 8px' : '2px 6px',
                borderRadius: 4,
                fontSize: isMobile ? 11 : 9,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              view all
            </button>
            <button
              onClick={() => setShowStats(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                padding: isMobile ? '4px 8px' : '2px 6px',
                borderRadius: 4,
                fontSize: isMobile ? 11 : 9,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
              title="Statistics"
            >
              stats
            </button>
            <button
              onClick={() => setShowImportExport(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.6)',
                padding: isMobile ? '4px 8px' : '2px 6px',
                borderRadius: 4,
                fontSize: isMobile ? 11 : 9,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
              title="Import / Export"
            >
              ⇄
            </button>
          </div>
        </div>

        {user && (
          <div style={{ fontSize: isMobile ? 9 : 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{user.email}</span>
            <span
              onClick={signOut}
              style={{ textDecoration: 'underline', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}
            >
              sign out
            </span>
          </div>
        )}

        <input
          ref={searchRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search demons... (Ctrl+F)"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: isMobile ? '8px 8px' : '4px 8px',
            color: 'white',
            fontSize: isMobile ? 13 : 11,
            fontFamily: 'monospace',
            outline: 'none',
            marginBottom: 4,
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 4 }}>
          {['all', 'Easy Demon', 'Medium Demon', 'Hard Demon', 'Insane Demon', 'Extreme Demon'].map((diff) => (
            <span
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              style={{
                fontSize: isMobile ? 11 : 9,
                fontFamily: 'monospace',
                padding: isMobile ? '4px 8px' : '2px 5px',
                borderRadius: 3,
                cursor: 'pointer',
                background: filterDifficulty === diff ? (diff === 'all' ? 'rgba(255,255,255,0.15)' : (DIFFICULTY_COLORS[diff] || 'rgba(255,255,255,0.15)')) : 'rgba(255,255,255,0.05)',
                color: filterDifficulty === diff ? (diff === 'all' ? 'white' : '#0a0015') : 'rgba(255,255,255,0.5)',
                fontWeight: filterDifficulty === diff ? 'bold' : 'normal',
              }}
            >
              {diff === 'all' ? 'all' : diff.split(' ')[0]}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 4 }}>
          {['all', 'beaten', 'future'].map((st) => (
            <span
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                fontSize: isMobile ? 11 : 9,
                fontFamily: 'monospace',
                padding: isMobile ? '4px 8px' : '2px 5px',
                borderRadius: 3,
                cursor: 'pointer',
                background: filterStatus === st ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.05)',
                color: filterStatus === st ? '#c084fc' : 'rgba(255,255,255,0.5)',
                fontWeight: filterStatus === st ? 'bold' : 'normal',
              }}
            >
              {st}
            </span>
          ))}
          <span style={{ flex: 1 }} />
          <span
            onClick={() => {
              if (sortBy === 'id') { setSortBy('name'); setSortDir('asc') }
              else if (sortBy === 'name') { setSortBy('difficulty'); setSortDir('asc') }
              else if (sortBy === 'difficulty') { setSortBy('date'); setSortDir('asc') }
              else if (sortBy === 'date') { setSortBy('id'); setSortDir('desc') }
            }}
            style={{
              fontSize: isMobile ? 11 : 9,
              fontFamily: 'monospace',
              padding: isMobile ? '4px 8px' : '2px 5px',
              borderRadius: 3,
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
            }}
            title="Change sort"
          >
            sort: {sortBy}{sortDir === 'desc' ? ' ↓' : ' ↑'}
          </span>
        </div>

        {filteredDemons.length === 0 && (
          <div style={{ fontSize: isMobile ? 10 : 11, opacity: 0.4, textAlign: 'center', padding: '12px 0' }}>
            {searchQuery || filterDifficulty !== 'all' || filterStatus !== 'all'
              ? 'No demons match your filters.'
              : 'No demons yet. Add one!'}
          </div>
        )}

        {filteredDemons.map((demon) => (
          <div
            key={demon.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 3,
              fontSize: isMobile ? 12 : 12,
              padding: isMobile ? '6px 3px' : '2px 3px',
              borderRadius: 4,
            }}
          >
            <span
              style={{
                width: isMobile ? 6 : 8,
                height: isMobile ? 6 : 8,
                borderRadius: '50%',
                background: DIFFICULTY_COLORS[demon.difficulty],
                display: 'inline-block',
                flexShrink: 0,
                boxShadow: demon.progress === 0 ? 'none' : `0 0 4px ${DIFFICULTY_COLORS[demon.difficulty]}`,
              }}
            />
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: demon.progress === 0 ? 0.5 : 1,
              }}
            >
              {demon.name}
            </span>
            <button
              onClick={() => setGoToPosition(demon.position)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: isMobile ? '4px 8px' : '2px 8px',
                borderRadius: 4,
                fontSize: isMobile ? 11 : 10,
                fontFamily: 'monospace',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              go to
            </button>
            <button
              onClick={() => { setConfirmRemove(demon); setRemoveInput('') }}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff4444',
                fontSize: isMobile ? 14 : 12,
                cursor: 'pointer',
                padding: isMobile ? '4px 6px' : '1px 3px',
                lineHeight: '12px',
                opacity: 0.7,
              }}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: '100%',
            marginTop: 6,
            background: 'rgba(192,132,252,0.15)',
            border: '1px dashed rgba(192,132,252,0.3)',
            color: '#c084fc',
            padding: isMobile ? '10px 0' : '6px 0',
            borderRadius: 6,
            fontSize: isMobile ? 13 : 12,
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          + Add Custom Demon
        </button>
      </div>

      <div
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          bottom: isMobile ? 8 : 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: 'rgba(255,255,255,0.5)',
          padding: isMobile ? '4px 10px' : '8px 16px',
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: isMobile ? 9 : 12,
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap',
        }}
      >
          {isMobile ? 'Drag · Scroll · Hover' : 'Drag to rotate · Scroll to zoom · Hover for details'}
          <span
            onClick={takeScreenshot}
            style={{
              marginLeft: isMobile ? 8 : 12,
              textDecoration: 'underline',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              padding: isMobile ? '4px 2px' : 0,
            }}
          >
            screenshot
          </span>
          <span
            onClick={() => setShowDocs(true)}
            style={{
              marginLeft: isMobile ? 8 : 12,
              textDecoration: 'underline',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              padding: isMobile ? '4px 2px' : 0,
            }}
          >
            docs
          </span>
      </div>
    </>,
    document.body
  )
}

export default UIOverlay
