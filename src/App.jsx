import { useEffect } from 'react'
import TimelineScene from './components/TimelineScene'
import UIOverlay from './components/UIOverlay'
import YouTubeModal from './components/YouTubeModal'
import YouTubeMiniPlayer from './components/YouTubeMiniPlayer'
import { useTimelineStore } from './store/timelineStore'
import demonData from './data/demons.json'
import config from './timeline.config'
import './App.css'

const APP_KEY = import.meta.env.VITE_APP_KEY

function App() {
  const initDemons = useTimelineStore((s) => s.initDemons)
  const youtubeVideoId = useTimelineStore((s) => s.youtubeVideoId)

  useEffect(() => {
    if (APP_KEY) initDemons(demonData.demons)
  }, [initDemons])

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
