import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './styles.css'
import App from './App.jsx'
import SetupNotice from './components/SetupNotice.jsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Service worker is for production only. In dev, an active SW + Vite HMR
// fight each other and serve stale modules. So in dev: unregister any
// previously-installed SW and nuke its caches so the dev page is always fresh.
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })

    // When a new SW takes control (after a deploy), reload once so the page
    // picks up the new hashed JS bundles instead of the cached old ones.
    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() =>
        'caches' in window
          ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
          : null,
      )
      .catch(() => {})
  }
}

const root = createRoot(document.getElementById('root'))

if (!publishableKey) {
  root.render(
    <StrictMode>
      <SetupNotice />
    </StrictMode>,
  )
} else {
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={{
          variables: {
            colorPrimary: '#2C2A25',
            colorBackground: '#FDFCF9',
            colorInputBackground: '#EDE8DF',
            colorInputText: '#2C2A25',
            colorText: '#2C2A25',
            colorTextSecondary: '#8A7F6E',
            colorNeutral: '#2C2A25',
            borderRadius: '10px',
            fontFamily: 'Jost, system-ui, sans-serif',
          },
          elements: {
            card: {
              backgroundColor: '#FDFCF9',
              border: '1px solid #E5E0D8',
              boxShadow: '0 20px 50px -30px rgba(60, 45, 25, 0.25)',
            },
            headerTitle: {
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: 500,
              fontSize: '28px',
              color: '#2C2A25',
            },
            headerSubtitle: { color: '#8A7F6E' },
            formButtonPrimary: {
              backgroundColor: '#2C2A25',
              color: '#F5F2ED',
              fontFamily: 'Jost, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.4px',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1a1814' },
            },
            socialButtonsBlockButton: { backgroundColor: '#EDE8DF', borderColor: '#E5E0D8' },
            footerActionLink: { color: '#C8922A' },
          },
        }}
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}
