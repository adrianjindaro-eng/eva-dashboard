import { useState } from 'react'
import {
  ROMAN_LENGTH_ALLOWANCE,
  ROMAN_WIDTH_ALLOWANCE,
  CalculateButton,
  NumberField,
  PatternRepeatToggle,
  ReadOnlyField,
  Results,
  ceilYards,
  roundUpToMultiple,
} from './calc-shared.jsx'

const SHADE_TYPES = [
  { value: 'flat', label: 'Flat Roman', enabled: true },
  { value: 'relaxed', label: 'Relaxed Roman', enabled: false },
  { value: 'balloon', label: 'Balloon Shade', enabled: false },
  { value: 'structured', label: 'Structured Roman', enabled: false },
]

function FlatRomanForm() {
  const [finishedWidth, setFinishedWidth] = useState('36')
  const [finishedLength, setFinishedLength] = useState('60')
  const [fabricWidth, setFabricWidth] = useState('54')
  const [quantity, setQuantity] = useState('1')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [vRepeat, setVRepeat] = useState('')
  const [hRepeat, setHRepeat] = useState('')
  const [result, setResult] = useState(null)

  function calculate() {
    const fw = parseFloat(finishedWidth) || 0
    const fl = parseFloat(finishedLength) || 0
    const fab = parseFloat(fabricWidth) || 0
    const qty = parseInt(quantity, 10) || 0

    if (!fw || !fl || !fab || !qty) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa todos los campos para calcular.',
      })
      return
    }

    let cutWidth = fw + ROMAN_WIDTH_ALLOWANCE
    let centerNote = ''
    const hr = hasRepeat ? parseFloat(hRepeat) || 0 : 0
    if (hr > 0) {
      const repeatsAcross = Math.ceil(fw / hr)
      const centered = repeatsAcross * hr
      cutWidth = centered + ROMAN_WIDTH_ALLOWANCE
      centerNote = ` Patrón centrado: ${repeatsAcross} × ${hr}" = ${centered}" + ${ROMAN_WIDTH_ALLOWANCE}" allowance.`
    }

    let cutLength = fl + ROMAN_LENGTH_ALLOWANCE
    let vRepeatNote = ''
    const vr = hasRepeat ? parseFloat(vRepeat) || 0 : 0
    if (vr > 0) {
      cutLength = roundUpToMultiple(cutLength, vr)
      vRepeatNote = ` Cut length redondeado al múltiplo de ${vr}" (repeat vertical).`
    }

    const widthsPerShade = Math.ceil(cutWidth / fab)
    const totalWidths = widthsPerShade * qty
    const totalYards = (totalWidths * cutLength) / 36
    const yardsRounded = ceilYards(totalYards)

    setResult({
      widthsNeeded: totalWidths.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: yardsRounded.toFixed(2),
      note:
        `${qty} shade${qty === 1 ? '' : 's'} · cut width ${cutWidth.toFixed(2)}" ÷ ${fab}" = ${widthsPerShade} width(s)/shade. ` +
        `Allowances: ${ROMAN_WIDTH_ALLOWANCE}" en ancho · ${ROMAN_LENGTH_ALLOWANCE}" en largo.` +
        centerNote +
        vRepeatNote,
    })
  }

  return (
    <div className="calc-form">
      <div className="grid-2">
        <NumberField
          label="Finished width"
          suffix="in"
          value={finishedWidth}
          onChange={setFinishedWidth}
        />
        <NumberField
          label="Finished length"
          suffix="in"
          value={finishedLength}
          onChange={setFinishedLength}
        />
      </div>

      <div className="grid-2">
        <ReadOnlyField
          label='Width allowance (4" cada lado)'
          value={ROMAN_WIDTH_ALLOWANCE}
          suffix="in (fijo)"
        />
        <ReadOnlyField
          label="Length allowance"
          value={ROMAN_LENGTH_ALLOWANCE}
          suffix="in (fijo)"
        />
      </div>

      <div className="grid-2">
        <NumberField
          label="Fabric width"
          suffix="in"
          value={fabricWidth}
          onChange={setFabricWidth}
        />
        <NumberField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          step="1"
          min="1"
        />
      </div>

      <PatternRepeatToggle checked={hasRepeat} onChange={setHasRepeat} />

      {hasRepeat && (
        <div className="grid-2 repeat-fields">
          <NumberField
            label="Vertical repeat"
            suffix="in"
            value={vRepeat}
            onChange={setVRepeat}
          />
          <NumberField
            label="Horizontal repeat"
            suffix="in"
            value={hRepeat}
            onChange={setHRepeat}
          />
        </div>
      )}

      <CalculateButton onClick={calculate} />
      <Results data={result} />
    </div>
  )
}

export default function RomansCalculator() {
  const [shadeType, setShadeType] = useState('flat')

  return (
    <div className="romans-flow">
      <div className="step-group">
        <span className="step-label">Tipo de shade</span>
        <div className="shade-types">
          {SHADE_TYPES.map((s) => {
            const isActive = shadeType === s.value
            return (
              <button
                key={s.value}
                type="button"
                disabled={!s.enabled}
                title={s.enabled ? '' : 'Próximamente'}
                className={`shade-type-btn ${isActive ? 'shade-type-active' : ''} ${
                  s.enabled ? '' : 'shade-type-disabled'
                }`}
                onClick={() => s.enabled && setShadeType(s.value)}
              >
                <span className="shade-type-title">{s.label}</span>
                {!s.enabled && (
                  <span className="shade-type-soon">Próximamente</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {shadeType === 'flat' && <FlatRomanForm />}
    </div>
  )
}
