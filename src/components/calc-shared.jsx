export const HEM_ALLOWANCE = 15
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

export function ceilYards(yards) {
  return Math.ceil(yards * 2) / 2
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
          <div className="result-label">Total yardage</div>
          <div className="result-value">
            {data.totalYardage}
            <span className="result-unit">yds</span>
          </div>
        </div>
      </div>
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
