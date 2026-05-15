import { SignIn } from '@clerk/clerk-react'

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <img src="/eva-logo.png" alt="Eva's Draperies" className="login-logo" />
          <p className="login-tagline">Tu panel de trabajo, simple y elegante.</p>
        </div>
        <div className="login-card-wrap">
          <SignIn
            routing="virtual"
            appearance={{
              elements: {
                rootBox: { width: '100%' },
                card: {
                  width: '100%',
                  backgroundColor: '#FDFCF9',
                  border: '1px solid #E5E0D8',
                  boxShadow: '0 20px 50px -30px rgba(60, 45, 25, 0.25)',
                  padding: '32px',
                },
              },
            }}
          />
        </div>
      </div>
      <footer className="login-footer">
        Powered by Jindaro. Simpler workflows. Smarter automation.
      </footer>
    </div>
  )
}
