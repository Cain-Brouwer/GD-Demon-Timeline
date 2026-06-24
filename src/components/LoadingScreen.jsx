function SkeletonBlock({ width, height, style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 4,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: '48px 20px',
      }}
    >
      {/* Title skeleton */}
      <div style={{ textAlign: 'center', maxWidth: 640 }}>
        <SkeletonBlock width="clamp(180px, 40vw, 380px)" height={72} />
        <div style={{ height: 12 }} />
        <SkeletonBlock width="clamp(140px, 30vw, 280px)" height={16} />
      </div>

      {/* Feature cards skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          maxWidth: 960,
          width: '100%',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 4,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <SkeletonBlock width="60%" height={14} />
            <SkeletonBlock width="100%" height={10} />
            <SkeletonBlock width="85%" height={10} />
          </div>
        ))}
      </div>

      {/* CTA skeleton */}
      <SkeletonBlock width={200} height={48} style={{ borderRadius: 4 }} />

      {/* Spinner */}
      <div
        style={{
          width: 16,
          height: 16,
          border: '2px solid rgba(207,188,255,0.15)',
          borderTopColor: '#cfbcff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}

export default LoadingScreen
