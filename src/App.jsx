import { SignedIn, SignedOut } from '@clerk/clerk-react'
import LoginPage from './components/LoginPage.jsx'
import Dashboard from './components/Dashboard.jsx'

export default function App() {
  return (
    <>
      <SignedOut>
        <LoginPage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}
