import { useEffect, useRef, useCallback, lazy, Suspense, useState } from 'react'
import UIOverlay from './components/UIOverlay'
import YouTubeModal from './components/YouTubeModal'
import YouTubeMiniPlayer from './components/YouTubeMiniPlayer'
import LandingPage from './components/LandingPage'
import DeviceWarning from './components/DeviceWarning'
import { useTimelineStore } from './store/timelineStore'
import { supabase } from './lib/supabase'
import demonData from './data/demons.json'
import config from './timeline.config'
import LoadingScreen from './components/LoadingScreen'
import TransitionOverlay from './components/TransitionOverlay'
import './App.css'

const TimelineScene = lazy(() => import('./components/TimelineScene'))

const APP_KEY = import.meta.env.VITE_APP_KEY

// Global error handler to capture the RAF loop error
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.warn('[global error]', e.message, e.filename, e.lineno, e.colno)
  })
  window.addEventListener('unhandledrejection', (e) => {
    console.warn('[unhandled rejection]', e.reason)
  })
}

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const initDemons = useTimelineStore((s) => s.initDemons)
  const setUser = useTimelineStore((s) => s.setUser)
  const user = useTimelineStore((s) => s.user)
  const cloudLoad = useTimelineStore((s) => s.cloudLoad)
  const cloudSave = useTimelineStore((s) => s.cloudSave)
  const demons = useTimelineStore((s) => s.demons)
  const selectedDemon = useTimelineStore((s) => s.selectedDemon)
  const selectDemon = useTimelineStore((s) => s.selectDemon)
  const clearSelection = useTimelineStore((s) => s.clearSelection)
  const clearYoutubeVideo = useTimelineStore((s) => s.clearYoutubeVideo)
  const youtubeVideoId = useTimelineStore((s) => s.youtubeVideoId)
  const performanceTested = useTimelineStore((s) => s.performanceTested)
  const syncedRef = useRef(false)

  const handleKeyDown = useCallback((e) => {
    const tag = document.activeElement?.tagName || ''
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    if (e.key === 'Escape') {
      if (youtubeVideoId) clearYoutubeVideo()
      else clearSelection()
      return
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const sorted = [...demons].sort((a, b) => a.id - b.id)
      if (sorted.length === 0) return
      if (!selectedDemon) { selectDemon(sorted[0]); return }
      const idx = sorted.findIndex((d) => d.id === selectedDemon.id)
      selectDemon(sorted[(idx + 1) % sorted.length])
      return
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const sorted = [...demons].sort((a, b) => a.id - b.id)
      if (sorted.length === 0) return
      if (!selectedDemon) { selectDemon(sorted[sorted.length - 1]); return }
      const idx = sorted.findIndex((d) => d.id === selectedDemon.id)
      selectDemon(sorted[(idx - 1 + sorted.length) % sorted.length])
      return
    }

    if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('focus-search'))
    }
  }, [demons, selectedDemon, selectDemon, clearSelection, clearYoutubeVideo, youtubeVideoId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (APP_KEY) initDemons(demonData.demons)
  }, [initDemons])

  useEffect(() => {
    if (!user && APP_KEY) {
      const demons = useTimelineStore.getState().demons
      if (demons.length === 0) initDemons(demonData.demons)
    }
  }, [user, initDemons])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    if (!user) {
      syncedRef.current = false
      return
    }
    if (!supabase || syncedRef.current) return
    syncedRef.current = true
    const timer = setTimeout(async () => {
      try {
        await cloudLoad()
        if (useTimelineStore.getState().cloudStatus === 'idle') {
          cloudSave()
        }
      } catch (e) {
        console.error('auto-sync error:', e)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [user, cloudLoad, cloudSave])

  if (!APP_KEY) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0015',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          color: 'white',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48, opacity: 0.2 }}>&#x1f512;</div>
        <div style={{ fontSize: 14, opacity: 0.5 }}>This application requires a configuration key.</div>
        <div style={{ fontSize: 11, opacity: 0.3 }}>
          Create a <code>.env</code> file with <code>VITE_APP_KEY</code> set to the correct value.
        </div>
      </div>
    )
  }

  if (showLanding) {
    const handleEnter = () => {
      setShowLanding(false)
    }
    return <LandingPage onEnter={handleEnter} />
  }

  return (
    <div className="app">
      <Suspense fallback={<LoadingScreen />}>
        <TimelineScene />
      </Suspense>
      <TransitionOverlay />
      <UIOverlay config={config} />
      <YouTubeModal />
      <YouTubeMiniPlayer key={youtubeVideoId || 'none'} />
      {!performanceTested && <DeviceWarning onClose={() => {}} />}
    </div>
  )
}

export default App
