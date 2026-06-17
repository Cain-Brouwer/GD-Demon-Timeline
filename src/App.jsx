import { useEffect, useRef } from 'react'
import TimelineScene from './components/TimelineScene'
import UIOverlay from './components/UIOverlay'
import YouTubeModal from './components/YouTubeModal'
import YouTubeMiniPlayer from './components/YouTubeMiniPlayer'
import { useTimelineStore } from './store/timelineStore'
import { supabase } from './lib/supabase'
import demonData from './data/demons.json'
import config from './timeline.config'
import './App.css'

const APP_KEY = import.meta.env.VITE_APP_KEY

function App() {
  const initDemons = useTimelineStore((s) => s.initDemons)
  const setUser = useTimelineStore((s) => s.setUser)
  const user = useTimelineStore((s) => s.user)
  const cloudLoad = useTimelineStore((s) => s.cloudLoad)
  const cloudSave = useTimelineStore((s) => s.cloudSave)
  const youtubeVideoId = useTimelineStore((s) => s.youtubeVideoId)
  const syncedRef = useRef(false)

  useEffect(() => {
    if (APP_KEY) initDemons(demonData.demons)
  }, [initDemons])

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

  return (
    <div className="app">
      <TimelineScene />
      <UIOverlay config={config} />
      <YouTubeModal />
      <YouTubeMiniPlayer key={youtubeVideoId || 'none'} />
    </div>
  )
}

export default App
