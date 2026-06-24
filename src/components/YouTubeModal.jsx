import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'

function YouTubeModal() {
  const videoId = useTimelineStore((s) => s.youtubeVideoId)
  const soundOnly = useTimelineStore((s) => s.youtubeSoundOnly)
  const setYoutubeVideo = useTimelineStore((s) => s.setYoutubeVideo)
  const clearYoutubeVideo = useTimelineStore((s) => s.clearYoutubeVideo)

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') clearYoutubeVideo()
    },
    [clearYoutubeVideo]
  )

  useEffect(() => {
    if (videoId && !soundOnly) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoId, soundOnly, handleKeyDown])

  if (!videoId || soundOnly) return null

  return createPortal(
    <div
      onClick={clearYoutubeVideo}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        cursor: 'pointer',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '80%',
          maxWidth: 960,
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            onClick={() => setYoutubeVideo(videoId, false)}
            style={{
              background: '#ff0033',
              border: 'none',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            Video
          </button>
          <button
            onClick={() => setYoutubeVideo(videoId, true)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
              opacity: 0.5,
            }}
          >
            Sound Only
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default YouTubeModal
