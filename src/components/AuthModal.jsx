import { createPortal } from 'react-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

function AuthModal({ onClose }) {
  if (!supabase) return null

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
        zIndex: 10002,
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
          width: 'min(380px, 90vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#c084fc' }}>Sign In</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 18,
              cursor: 'pointer',
              fontFamily: 'monospace',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#c084fc',
                  brandAccent: '#a855f7',
                  brandButtonText: 'white',
                  defaultButtonBackground: 'rgba(255,255,255,0.08)',
                  defaultButtonBackgroundHover: 'rgba(255,255,255,0.12)',
                  inputBackground: 'rgba(255,255,255,0.06)',
                  inputBorder: 'rgba(255,255,255,0.12)',
                  inputBorderHover: 'rgba(255,255,255,0.2)',
                  inputBorderFocus: '#c084fc',
                  inputText: 'white',
                  inputLabelText: 'rgba(255,255,255,0.7)',
                  messageText: 'rgba(255,255,255,0.6)',
                  messageTextDanger: '#ff6b6b',
                  anchorTextColor: '#c084fc',
                  dividerBackground: 'rgba(255,255,255,0.1)',
                },
                space: {
                  inputPadding: '10px 12px',
                  buttonPadding: '10px 12px',
                },
                fontSizes: {
                  baseBodySize: '13px',
                  baseInputSize: '13px',
                  baseLabelSize: '12px',
                  baseButtonSize: '13px',
                },
                radii: {
                  borderRadiusButton: '6px',
                  buttonBorderRadius: '6px',
                  inputBorderRadius: '6px',
                },
              },
            },
            style: {
              button: { fontFamily: 'monospace' },
              input: { fontFamily: 'monospace' },
              label: { fontFamily: 'monospace' },
              message: { fontFamily: 'monospace' },
              divider: { fontFamily: 'monospace' },
              anchor: { fontFamily: 'monospace' },
            },
          }}
          providers={[]}
          onlyThirdPartyProviders={false}
        />
      </div>
    </div>,
    document.body
  )
}

export default AuthModal
