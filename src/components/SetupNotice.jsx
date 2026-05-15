export default function SetupNotice() {
  return (
    <div className="setup-notice">
      <div className="setup-card">
        <h1 className="setup-title">Eva's Draperies</h1>
        <p className="setup-eyebrow">Configuración inicial</p>
        <p className="setup-body">
          Para habilitar el inicio de sesión, agrega tu publishable key de Clerk al archivo
          <code> .env.local </code> en la raíz del proyecto:
        </p>
        <pre className="setup-code">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</pre>
        <p className="setup-body">
          Después reinicia el servidor con <code>npm run dev</code>.
        </p>
        <p className="setup-hint">
          Puedes crear una cuenta gratis y obtener tu key en{' '}
          <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer">
            dashboard.clerk.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
