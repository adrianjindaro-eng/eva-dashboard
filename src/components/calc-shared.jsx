export const HEM_PLEATED = 16
export const HEM_RIPPLE = 11
export const OVERLAP = 3.5
export const ROMAN_WIDTH_ALLOWANCE = 8
export const ROMAN_LENGTH_ALLOWANCE = 10

export function roundUpToMultiple(value, step) {
  if (!step || step <= 0) return value
  return Math.ceil(value / step) * step
}

export function roundUpToEven(value) {
  const n = Math.ceil(value)
  return n % 2 === 0 ? n : n + 1
}

export function roundUpToHalf(value) {
  return Math.ceil(value * 2) / 2
}

const EIGHTH_FRACTIONS = ['', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8']

// Format a decimal inch value as a mixed fraction rounded to the nearest 1/8".
// 4.61  -> "4 5/8"
// 4.0   -> "4"
// 2.125 -> "2 1/8"
// 0.5   -> "1/2"
export function toEighthFraction(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value)
  const sign = value < 0 ? '-' : ''
  const eighths = Math.round(Math.abs(value) * 8)
  const whole = Math.floor(eighths / 8)
  const r = eighths % 8
  if (r === 0) return `${sign}${whole}`
  if (whole === 0) return `${sign}${EIGHTH_FRACTIONS[r]}`
  return `${sign}${whole} ${EIGHTH_FRACTIONS[r]}`
}

export function ceilYards(yards) {
  return Math.ceil(yards * 2) / 2
}

export const OVERAGE_PCT = 0.1

export function buildBreakdown(rawInches) {
  const needed = rawInches / 36
  const overage = needed * OVERAGE_PCT
  const total = needed + overage
  const rounded = ceilYards(total)
  return {
    needed: needed,
    overage: overage,
    total: rounded,
  }
}

export function packOverages(overages, fabWidth) {
  const sorted = [...overages].sort((a, b) => b.overage - a.overage)
  const bins = []
  for (const o of sorted) {
    if (o.overage <= 0) continue
    let placed = false
    for (const bin of bins) {
      if (bin.remaining >= o.overage) {
        bin.remaining -= o.overage
        if (o.cutLength > bin.maxLength) bin.maxLength = o.cutLength
        placed = true
        break
      }
    }
    if (!placed) {
      bins.push({ remaining: fabWidth - o.overage, maxLength: o.cutLength })
    }
  }
  return bins
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = '0.25',
  min = '0',
  placeholder,
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
    </label>
  )
}

export function ReadOnlyField({ label, value, suffix }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap field-input-readonly">
        <input type="text" value={value} readOnly tabIndex={-1} />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
    </label>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ButtonGroup({ label, value, onChange, options, columns = 3, note }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div
        className="button-group"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              className={`pill-btn ${active ? 'pill-btn-active' : ''}`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {note && <span className="field-note">{note}</span>}
    </div>
  )
}

export function PatternRepeatToggle({ checked, onChange, label = 'Tela con pattern repeat' }) {
  return (
    <label className="checkbox-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

export function Results({ data }) {
  if (!data) return null
  return (
    <div className="results">
      <h3 className="results-title">Resultados</h3>
      <div className="results-grid">
        <div className="result-card">
          <div className="result-label">Widths necesarios</div>
          <div className="result-value">{data.widthsNeeded}</div>
        </div>
        <div className="result-card">
          <div className="result-label">Cut length</div>
          <div className="result-value">
            {data.cutLength}
            <span className="result-unit">in</span>
          </div>
        </div>
        <div className="result-card highlight">
          <div className="result-label">Total a ordenar</div>
          <div className="result-value">
            {data.totalYardage}
            <span className="result-unit">yds</span>
          </div>
        </div>
        {Array.isArray(data.primaryExtras) &&
          data.primaryExtras.map((e, i) => (
            <div key={`primary-${i}`} className="result-card">
              <div className="result-label">{e.label}</div>
              <div className="result-value">
                {e.value}
                {e.unit && <span className="result-unit">{e.unit}</span>}
              </div>
              {e.hint && <div className="result-card-hint">{e.hint}</div>}
            </div>
          ))}
      </div>

      {data.breakdown && (
        <div className="yardage-breakdown">
          <div className="breakdown-row">
            <span className="breakdown-label">Yardage needed</span>
            <span className="breakdown-value">{data.breakdown.needed} yds</span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">10% overage</span>
            <span className="breakdown-value">{data.breakdown.overage} yds</span>
          </div>
          <div className="breakdown-row breakdown-total">
            <span className="breakdown-label">Total a ordenar</span>
            <span className="breakdown-value">{data.breakdown.total} yds</span>
          </div>
        </div>
      )}

      {Array.isArray(data.extras) && data.extras.length > 0 && (
        <div className="results-extras">
          {data.extras.map((e, i) => (
            <div key={i} className="result-extra">
              <div className="result-extra-main">
                <div className="result-label">{e.label}</div>
                <div className="result-value">
                  {e.value}
                  {e.unit && <span className="result-unit">{e.unit}</span>}
                </div>
              </div>
              {e.hint && <div className="result-extra-hint">{e.hint}</div>}
            </div>
          ))}
        </div>
      )}
      {data.note && <p className="results-note">{data.note}</p>}
    </div>
  )
}

export function CalculateButton({ onClick, children = 'Calcular yardage' }) {
  return (
    <button type="button" className="calc-button" onClick={onClick}>
      {children}
    </button>
  )
}
