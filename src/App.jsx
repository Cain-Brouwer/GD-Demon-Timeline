import { useEffect } from 'react'
import TimelineScene from './components/TimelineScene'
import UIOverlay from './components/UIOverlay'
import YouTubeModal from './components/YouTubeModal'
import YouTubeMiniPlayer from './components/YouTubeMiniPlayer'
import { useTimelineStore } from './store/timelineStore'
import demonData from './data/demons.json'
import config from './timeline.config'
import './App.css'

function App() {
  const initDemons = useTimelineStore((s) => s.initDemons)
  const youtubeVideoId = useTimelineStore((s) => s.youtubeVideoId)

  useEffect(() => {
    initDemons(demonData.demons)
  }, [initDemons])

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
