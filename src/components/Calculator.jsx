import { useState } from 'react'
import DrapesCalculator from './DrapesCalculator.jsx'
import RomansCalculator from './RomansCalculator.jsx'

export default function Calculator() {
  const [tab, setTab] = useState('drapes')
  return (
    <section className="card calc-card">
      <header className="card-header">
        <h2 className="card-title">Yardage Calculator</h2>
        <p className="card-subtitle">
          Calcula yardaje con precisión para cortinas y roman shades.
        </p>
      </header>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'drapes'}
          className={`tab ${tab === 'drapes' ? 'tab-active' : ''}`}
          onClick={() => setTab('drapes')}
        >
          Drapes
        </button>
        <button
          role="tab"
          aria-selected={tab === 'romans'}
          className={`tab ${tab === 'romans' ? 'tab-active' : ''}`}
          onClick={() => setTab('romans')}
        >
          Romans
        </button>
      </div>

      {tab === 'drapes' ? <DrapesCalculator /> : <RomansCalculator />}
    </section>
  )
}
