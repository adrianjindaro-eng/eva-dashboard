import { useEffect, useState } from 'react'
import { UserButton } from '@clerk/clerk-react'
import Calculator from './Calculator.jsx'
import PlaceholderCards from './PlaceholderCards.jsx'
import Footer from './Footer.jsx'

function formatSpanishDateTime(date) {
  const time = date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const dateStr = date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return { time, date: dateStr }
}

function spanishGreeting(date) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Buenos días, Eva.'
  if (h >= 12 && h < 19) return 'Buenas tardes, Eva.'
  return 'Buenas noches, Eva.'
}

function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const { time, date } = formatSpanishDateTime(now)
  return (
    <div className="clock">
      <div className="clock-time">{time}</div>
      <div className="clock-date">{date}</div>
    </div>
  )
}

function Greeting() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return <h2 className="greeting">{spanishGreeting(now)}</h2>
}

export default function Dashboard({ hideUserButton = false }) {
  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <img src="/eva-logo.png" alt="Eva's Draperies" className="brand-logo" />
          <h1 className="brand-name">Eva's Draperies</h1>
        </div>
        <div className="header-right">
          <LiveClock />
          {!hideUserButton && <UserButton afterSignOutUrl="/" />}
        </div>
      </header>

      <main className="main">
        <Greeting />
        <Calculator />
        <PlaceholderCards />
      </main>

      <Footer />
    </div>
  )
}
