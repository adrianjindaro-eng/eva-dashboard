import { useEffect, useState } from 'react'
import {
  ROMAN_LENGTH_ALLOWANCE,
  ROMAN_WIDTH_ALLOWANCE,
  CalculateButton,
  NumberField,
  PatternRepeatToggle,
  ReadOnlyField,
  Results,
  buildBreakdown,
  packOverages,
  roundUpToMultiple,
} from './calc-shared.jsx'

const SHADE_TYPES = [
  { value: 'flat', label: 'Flat Roman', enabled: true },
  { value: 'relaxed', label: 'Relaxed Roman', enabled: false },
  { value: 'balloon', label: 'Balloon Shade', enabled: false },
  { value: 'structured', label: 'Structured Roman', enabled: false },
]

function FlatRomanForm() {
  const [quantity, setQuantity] = useState('1')
  const [sameSize, setSameSize] = useState(true)
  const [finishedWidth, setFinishedWidth] = useState('36')
  const [finishedLength, setFinishedLength] = useState('60')
  const [shades, setShades] = useState([{ width: '36', length: '60' }])
  const [fabricWidth, setFabricWidth] = useState('54')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [vRepeat, setVRepeat] = useState('')
  const [hRepeat, setHRepeat] = useState('')
  const [result, setResult] = useState(null)

  const qty = parseInt(quantity, 10) || 0
  const showSameSizeToggle = qty > 1
  const useSameSize = qty <= 1 ? true : sameSize

  useEffect(() => {
    if (qty <= 0) return
    setShades((prev) => {
      const fallback = { width: finishedWidth, length: finishedLength }
      const next = [...prev]
      while (next.length < qty) next.push({ ...(prev[next.length - 1] || fallback) })
      return next.slice(0, qty)
    })
  }, [qty, finishedWidth, finishedLength])

  function setShadeField(i, field, value) {
    setShades((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    )
  }

  function calculate() {
    const fab = parseFloat(fabricWidth) || 0
    if (!qty || !fab) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa todos los campos para calcular.',
      })
      return
    }

    const vr = hasRepeat ? parseFloat(vRepeat) || 0 : 0
    const hr = hasRepeat ? parseFloat(hRepeat) || 0 : 0

    const shadeList = useSameSize
      ? Array.from({ length: qty }, () => ({
          width: parseFloat(finishedWidth) || 0,
          length: parseFloat(finishedLength) || 0,
        }))
      : shades.slice(0, qty).map((s) => ({
          width: parseFloat(s.width) || 0,
          length: parseFloat(s.length) || 0,
        }))

    if (shadeList.some((s) => !s.width || !s.length)) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa el ancho y largo de cada cortina.',
      })
      return
    }

    const cuts = shadeList.map((s) => {
      let cutWidth = s.width + ROMAN_WIDTH_ALLOWANCE
      if (hr > 0) {
        const repeats = Math.ceil(s.width / hr)
        cutWidth = repeats * hr + ROMAN_WIDTH_ALLOWANCE
      }
      let cutLength = s.length + ROMAN_LENGTH_ALLOWANCE
      if (vr > 0) cutLength = roundUpToMultiple(cutLength, vr)
      return { cutWidth, cutLength }
    })

    const fullCutsPerShade = cuts.map((c) => Math.floor(c.cutWidth / fab))
    const overages = cuts.map((c, i) => ({
      overage: c.cutWidth - fullCutsPerShade[i] * fab,
      cutLength: c.cutLength,
      shadeIdx: i,
    }))

    const baseFullCuts = fullCutsPerShade.reduce((sum, n) => sum + n, 0)
    const baseFullInches = fullCutsPerShade.reduce(
      (sum, n, i) => sum + n * cuts[i].cutLength,
      0,
    )

    const overagesNonZero = overages.filter((o) => o.overage > 0)
    const handledByFullCuts = overages.filter((o) => o.overage === 0).length

    const bins = packOverages(overagesNonZero, fab)
    const extraCuts = bins.length
    const extraInches = bins.reduce((sum, b) => sum + b.maxLength, 0)

    const totalWidths = baseFullCuts + extraCuts
    const totalFabricInches = baseFullInches + extraInches
    const breakdown = buildBreakdown(totalFabricInches)

    const allSameCutLength = cuts.every((c) => c.cutLength === cuts[0].cutLength)
    const cutLengthDisplay = allSameCutLength
      ? cuts[0].cutLength.toFixed(2)
      : `${Math.min(...cuts.map((c) => c.cutLength)).toFixed(2)}–${Math.max(
          ...cuts.map((c) => c.cutLength),
        ).toFixed(2)}`

    const sharedNote =
      overagesNonZero.length > 0
        ? ` Pool de extras: ${overagesNonZero.length} sobreancho(s) → ${extraCuts} cut(s) compartido(s).`
        : ''

    const centerNote =
      hr > 0
        ? ` Patrón centrado al múltiplo del repeat horizontal de ${hr}".`
        : ''
    const vRepeatNote =
      vr > 0 ? ` Cut length redondeado al múltiplo de ${vr}" (repeat vertical).` : ''

    setResult({
      widthsNeeded: String(totalWidths),
      cutLength: cutLengthDisplay,
      totalYardage: breakdown.total.toFixed(2),
      breakdown: {
        needed: breakdown.needed.toFixed(2),
        overage: breakdown.overage.toFixed(2),
        total: breakdown.total.toFixed(2),
      },
      note:
        `${qty} cortina${qty === 1 ? '' : 's'} · ${useSameSize ? 'mismo tamaño' : 'tamaños distintos'} · ` +
        `${baseFullCuts} cut(s) completos + ${extraCuts} cut(s) extra.` +
        (handledByFullCuts > 0 && qty > 1
          ? ` ${handledByFullCuts} cortina(s) sin sobreancho.`
          : '') +
        sharedNote +
        centerNote +
        vRepeatNote,
    })
  }

  return (
    <div className="calc-form">
      <div className="grid-2">
        <NumberField
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          step="1"
          min="1"
        />
        <NumberField
          label="Fabric width"
          suffix="in"
          value={fabricWidth}
          onChange={setFabricWidth}
        />
      </div>

      {showSameSizeToggle && (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={sameSize}
            onChange={(e) => setSameSize(e.target.checked)}
          />
          <span>¿Las cortinas son del mismo tamaño?</span>
        </label>
      )}

      {useSameSize ? (
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
      ) : (
        <div className="shade-list">
          <div className="shade-list-header">
            Tamaños por cortina ({qty})
          </div>
          {Array.from({ length: qty }).map((_, i) => (
            <div key={i} className="shade-row">
              <div className="shade-row-label">Cortina {i + 1}</div>
              <div className="grid-2 shade-row-fields">
                <NumberField
                  label="Width"
                  suffix="in"
                  value={shades[i]?.width ?? ''}
                  onChange={(v) => setShadeField(i, 'width', v)}
                />
                <NumberField
                  label="Length"
                  suffix="in"
                  value={shades[i]?.length ?? ''}
                  onChange={(v) => setShadeField(i, 'length', v)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
