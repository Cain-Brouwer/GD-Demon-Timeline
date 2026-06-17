import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
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
            padding: 24,
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.2 }}>&#x26a0;</div>
          <div style={{ fontSize: 14, opacity: 0.5 }}>Something went wrong.</div>
          <div style={{ fontSize: 11, opacity: 0.3 }}>Please refresh the page.</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
