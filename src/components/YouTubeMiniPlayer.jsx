import { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useTimelineStore } from '../store/timelineStore'

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

function getYouTubeId(url) {
  try {
    const params = new URLSearchParams(new URL(url).search)
    return params.get('v')
  } catch {
    return null
  }
}

function formatTime(s) {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

let apiPromise = null
function loadYouTubeAPI() {
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev()
        resolve()
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    })
  }
  return apiPromise
}

function YouTubeMiniPlayer() {
  const videoId = useTimelineStore((s) => s.youtubeVideoId)
  const soundOnly = useTimelineStore((s) => s.youtubeSoundOnly)
  const clearYoutubeVideo = useTimelineStore((s) => s.clearYoutubeVideo)
  const demons = useTimelineStore((s) => s.demons)
  const isMobile = useMedia('(max-width: 600px)')

  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const intervalRef = useRef(null)
  const fadeAnimRef = useRef(null)
  const targetVolumeRef = useRef(100)

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [fadingIn, setFadingIn] = useState(false)

  const demon = demons.find((d) => d.showcaseUrl && getYouTubeId(d.showcaseUrl) === videoId)

  function fadeIn(targetVol, durationMs = 1500) {
    if (fadeAnimRef.current) cancelAnimationFrame(fadeAnimRef.current)
    const start = performance.now()
    setFadingIn(true)

    function step(now) {
      const elapsed = now - start
      const t = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const vol = Math.round(eased * targetVol)
      try {
        playerRef.current?.setVolume(vol)
      } catch {}
      if (t < 1) {
        fadeAnimRef.current = requestAnimationFrame(step)
      } else {
        setFadingIn(false)
        fadeAnimRef.current = null
      }
    }
    fadeAnimRef.current = requestAnimationFrame(step)
  }

  useEffect(() => {
    if (!videoId || !soundOnly) return

    let cancelled = false

    loadYouTubeAPI().then(() => {
      if (cancelled) return
      playerRef.current = new YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            setReady(true)
            setDuration(playerRef.current.getDuration())
            playerRef.current.setVolume(0)
            playerRef.current.playVideo()
            targetVolumeRef.current = volume
            fadeIn(volume)
          },
          onStateChange: (e) => {
            if (cancelled) return
            setPlaying(e.data === YT.PlayerState.PLAYING)
          },
        },
      })
    })

    return () => {
      cancelled = true
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current)
        fadeAnimRef.current = null
      }
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [videoId, soundOnly])

  useEffect(() => {
    if (playing && playerRef.current) {
      intervalRef.current = setInterval(() => {
        try {
          const t = playerRef.current.getCurrentTime()
          if (isFinite(t)) setCurrentTime(t)
        } catch {}
      }, 250)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [playing])

  useEffect(() => {
    if (ready && playerRef.current) {
      playerRef.current.setVolume(volume)
    }
  }, [volume, ready])

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return
    if (playing) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }, [playing])

  const handleSeek = useCallback((e) => {
    const t = parseFloat(e.target.value)
    if (playerRef.current) {
      playerRef.current.seekTo(t, true)
    }
    setCurrentTime(t)
  }, [])

  if (!videoId || !soundOnly) return null

  return createPortal(
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 0, 21, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          zIndex: 9999,
          fontFamily: 'monospace',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 12,
          padding: isMobile ? '6px 8px' : '8px 16px',
          backdropFilter: 'blur(12px)',
          animation: 'slideUp 0.35s ease-out',
        }}
    >
      <div
        ref={containerRef}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
      />

      <button
        onClick={togglePlay}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: isMobile ? 16 : 18,
          cursor: 'pointer',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: isMobile ? 28 : 32,
        }}
        title={playing ? 'Pause' : 'Play'}
      >
        {fadingIn ? (
          <span style={{ fontSize: isMobile ? 12 : 14, opacity: 0.6 }}>♫</span>
        ) : playing ? (
          '⏸'
        ) : (
          '▶'
        )}
      </button>

      {!isMobile && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {demon?.name || 'Loading...'}
          </div>
          <div style={{ fontSize: 10, opacity: 0.5 }}>
            {demon?.musicTitle ? `${demon.musicTitle} — ${demon.musicArtist || 'Unknown'}` : ''}
          </div>
        </div>
      )}

      <div style={{ flex: isMobile ? 3 : 2, maxWidth: isMobile ? 'none' : 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            height: 4,
            cursor: 'pointer',
            accentColor: '#c084fc',
          }}
        />
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
              opacity: 0.5,
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: isMobile ? 10 : 11, opacity: 0.5 }}>♪</span>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          style={{
            width: isMobile ? 40 : 60,
            height: 4,
            cursor: 'pointer',
            accentColor: '#c084fc',
          }}
        />
      </div>

      <button
        onClick={clearYoutubeVideo}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          fontSize: isMobile ? 14 : 16,
          cursor: 'pointer',
          padding: '4px 6px',
        }}
        title="Close"
      >
        ✕
      </button>
    </div>,
    document.body
  )
}

export default YouTubeMiniPlayer
