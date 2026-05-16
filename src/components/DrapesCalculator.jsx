import { useState } from 'react'
import {
  HEM_PLEATED,
  HEM_RIPPLE,
  OVERLAP,
  ButtonGroup,
  CalculateButton,
  NumberField,
  PatternRepeatToggle,
  ReadOnlyField,
  Results,
  SelectField,
  buildBreakdown,
  roundUpToEven,
  roundUpToHalf,
  roundUpToMultiple,
  toEighthFraction,
} from './calc-shared.jsx'

const PANEL_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  value: String(n),
  label: String(n),
}))

const WIDTHS_PER_PANEL_OPTIONS = ['1', '1.5', '2', '2.5', '3'].map((v) => ({
  value: v,
  label: `${v} width${v === '1' ? '' : 's'}`,
}))

const RETURN_OPTIONS = [
  { value: '4', label: '4 in' },
  { value: '8', label: '8 in' },
  { value: 'custom', label: 'Custom' },
]

const FULLNESS_OPTIONS = [
  { value: '60', label: '60%' },
  { value: '80', label: '80%' },
  { value: '100', label: '100%' },
  { value: '120', label: '120%' },
]

const CARRIER_SPACING = {
  60: 2.625,
  80: 2.375,
  100: 2.125,
  120: 1.875,
}

function applyVerticalRepeat(cutLength, hasRepeat, vRepeat) {
  if (!hasRepeat) return { length: cutLength, note: '' }
  const vr = parseFloat(vRepeat) || 0
  if (vr <= 0) return { length: cutLength, note: '' }
  const adjusted = roundUpToMultiple(cutLength, vr)
  return {
    length: adjusted,
    note: ` Cut length redondeado al múltiplo de ${vr}" (repeat vertical).`,
  }
}

function StationaryForm() {
  const [panels, setPanels] = useState('2')
  const [widthsPerPanel, setWidthsPerPanel] = useState('2')
  const [finishedLength, setFinishedLength] = useState('96')
  const [fabricWidth, setFabricWidth] = useState('54')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [vRepeat, setVRepeat] = useState('')
  const [result, setResult] = useState(null)

  function calculate() {
    const p = parseInt(panels, 10) || 0
    const wpp = parseFloat(widthsPerPanel) || 0
    const fl = parseFloat(finishedLength) || 0
    const fw = parseFloat(fabricWidth) || 0
    if (!p || !wpp || !fl || !fw) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa todos los campos para calcular.',
      })
      return
    }
    const adjustedWidthsPerPanel = wpp * (54 / fw)
    const totalWidthsRaw = adjustedWidthsPerPanel * p
    const widthsNeeded = Math.ceil(totalWidthsRaw * 2) / 2

    const baseCut = fl + HEM_PLEATED
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalInches = widthsNeeded * cutLength
    const breakdown = buildBreakdown(totalInches)

    const adjustmentNote =
      fw === 54
        ? ''
        : ` Widths/panel ajustados a tela de ${fw}" (referencia 54").`

    setResult({
      widthsNeeded: widthsNeeded.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: breakdown.total.toFixed(2),
      breakdown: {
        needed: breakdown.needed.toFixed(2),
        overage: breakdown.overage.toFixed(2),
        total: breakdown.total.toFixed(2),
      },
      note:
        `${p} panel${p === 1 ? '' : 'es'} · ${wpp} width(s)/panel · hem ${HEM_PLEATED}" incluido.` +
        adjustmentNote +
        repeatNote,
    })
  }

  return (
    <div className="calc-form">
      <div className="grid-2">
        <SelectField
          label="Number of panels"
          value={panels}
          onChange={setPanels}
          options={PANEL_OPTIONS}
        />
        <SelectField
          label='Widths per panel (asumiendo 54")'
          value={widthsPerPanel}
          onChange={setWidthsPerPanel}
          options={WIDTHS_PER_PANEL_OPTIONS}
        />
      </div>

      <p className="field-note">
        Si el ancho de tela no es 54", el cálculo se ajusta proporcionalmente.
      </p>

      <div className="grid-2">
        <NumberField
          label="Finished length"
          suffix="in"
          value={finishedLength}
          onChange={setFinishedLength}
        />
        <NumberField
          label="Fabric width"
          suffix="in"
          value={fabricWidth}
          onChange={setFabricWidth}
        />
      </div>

      <ReadOnlyField label="Hem allowance" value={HEM_PLEATED} suffix="in (fijo)" />

      <PatternRepeatToggle checked={hasRepeat} onChange={setHasRepeat} />

      {hasRepeat && (
        <div className="repeat-fields">
          <NumberField
            label="Vertical repeat"
            suffix="in"
            value={vRepeat}
            onChange={setVRepeat}
          />
        </div>
      )}

      <CalculateButton onClick={calculate} />
      <Results data={result} />
    </div>
  )
}

const PLEAT_STYLE_OPTIONS = [
  { value: 'pinch', label: 'Pinch Pleat' },
  { value: 'french', label: 'French Pleat' },
]

const PLEAT_SIZE = 5 // inches consumed per pleat
const PLEAT_SPACING_MIN = 4
const PLEAT_SPACING_MAX = 6
const PLEAT_SIDE_HEMS = 3 // 1.5" per side × 2
const PLEAT_LEADING_EDGE = 3.5

// Per-panel pleat math:
// 1. Base pleat count targets ~5" spacing: P_base = round(FW / 5)
// 2. Add 1 ease pleat → P_total = P_base + 1
// 3. Verify spacing = FW / P_total ∈ [4, 6], adjust ±1 if outside
// 4. Required flat fabric = FW + P_total × 5
// 5. Widths per panel = ceil(required_flat / fw) to next half-width
function pleatMathForPanel(finishedWidth, fabricWidth) {
  const pBase = Math.max(2, Math.round(finishedWidth / 5))
  let pTotal = pBase + 1
  let spacing = finishedWidth / pTotal

  // Spacing too tight → drop a pleat (widens spacing)
  while (spacing < PLEAT_SPACING_MIN && pTotal > 2) {
    pTotal -= 1
    spacing = finishedWidth / pTotal
  }
  // Spacing too wide → add a pleat (narrows spacing)
  while (spacing > PLEAT_SPACING_MAX) {
    pTotal += 1
    spacing = finishedWidth / pTotal
  }

  const requiredFlat = finishedWidth + pTotal * PLEAT_SIZE
  const widthsPerPanel = roundUpToHalf(requiredFlat / fabricWidth)

  return { finishedWidth, pTotal, spacing, requiredFlat, widthsPerPanel }
}

function finishedWidthPerPanel(rod, panels, returnSize, kind) {
  // Each panel's flat finished-width along the rod (after pleating):
  //   End:    rod/panels + return + 3.5 leading edge + 3 side hems
  //   Center: rod/panels + 3.5 + 3.5 leading edges + 3 side hems
  //   Single: rod        + return + 3.5 leading edge + 3 side hems
  const baseShare = panels === 1 ? rod : rod / panels
  if (kind === 'single') {
    return baseShare + returnSize + PLEAT_LEADING_EDGE + PLEAT_SIDE_HEMS
  }
  if (kind === 'end') {
    return baseShare + returnSize + PLEAT_LEADING_EDGE + PLEAT_SIDE_HEMS
  }
  // center
  return baseShare + PLEAT_LEADING_EDGE + PLEAT_LEADING_EDGE + PLEAT_SIDE_HEMS
}

function RingsCarriersForm() {
  const [pleatStyle, setPleatStyle] = useState('pinch')
  const [rodSize, setRodSize] = useState('100')
  const [panels, setPanels] = useState('2')
  const [fabricWidth, setFabricWidth] = useState('54')
  const [returnChoice, setReturnChoice] = useState('8')
  const [customReturn, setCustomReturn] = useState('')
  const [finishedLength, setFinishedLength] = useState('96')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [vRepeat, setVRepeat] = useState('')
  const [result, setResult] = useState(null)

  function calculate() {
    const rod = parseFloat(rodSize) || 0
    const p = parseInt(panels, 10) || 0
    const fw = parseFloat(fabricWidth) || 0
    const fl = parseFloat(finishedLength) || 0
    const ret =
      returnChoice === 'custom' ? parseFloat(customReturn) || 0 : parseFloat(returnChoice)

    if (!rod || !p || !fw || !fl) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa todos los campos para calcular.',
      })
      return
    }

    // Compute per-panel results, grouped by kind
    const groups = []
    if (p === 1) {
      const fwPanel = finishedWidthPerPanel(rod, 1, ret, 'single')
      groups.push({ kind: 'single', count: 1, ...pleatMathForPanel(fwPanel, fw) })
    } else {
      const endFW = finishedWidthPerPanel(rod, p, ret, 'end')
      groups.push({ kind: 'end', count: 2, ...pleatMathForPanel(endFW, fw) })
      if (p > 2) {
        const centerFW = finishedWidthPerPanel(rod, p, ret, 'center')
        groups.push({
          kind: 'center',
          count: p - 2,
          ...pleatMathForPanel(centerFW, fw),
        })
      }
    }

    const totalWidths = groups.reduce(
      (sum, g) => sum + g.widthsPerPanel * g.count,
      0,
    )

    const baseCut = fl + HEM_PLEATED
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalFabricInches = totalWidths * cutLength
    const breakdown = buildBreakdown(totalFabricInches)
    const approxRings = Math.round(totalWidths * 5)

    // Format per-panel breakdown for display
    const kindLabel = (k, count) => {
      if (k === 'single') return count === 1 ? 'panel' : 'paneles'
      if (k === 'end') return count === 1 ? 'panel extremo' : 'paneles extremos'
      return count === 1 ? 'panel central' : 'paneles centrales'
    }
    const panelSummary = groups
      .map(
        (g) =>
          `${g.count} ${kindLabel(g.kind, g.count)}: ` +
          `FW ${g.finishedWidth.toFixed(2)}" → ${g.widthsPerPanel} widths · ` +
          `${g.pTotal} pleats · spacing ${toEighthFraction(g.spacing)}"`,
      )
      .join(' · ')

    // Extras: if mixed end/center, show "end / center" pairs; otherwise single value
    const multiKind = groups.length > 1
    const fmtPerPanel = (key, decimals = 0, suffix = '') =>
      groups
        .map((g) =>
          typeof g[key] === 'number'
            ? `${g[key].toFixed(decimals)}${suffix}`
            : `${g[key]}${suffix}`,
        )
        .join(' / ')
    const fmtPerPanelFraction = (key) =>
      groups
        .map((g) =>
          typeof g[key] === 'number' ? toEighthFraction(g[key]) : String(g[key]),
        )
        .join(' · ')

    const primaryExtras = [
      {
        label: 'Pleats per panel',
        value: fmtPerPanel('pTotal'),
        hint: multiKind ? 'extremo / central' : null,
      },
      {
        label: 'Spacing between pleats',
        value: fmtPerPanelFraction('spacing'),
        unit: 'in',
        hint: multiKind ? 'extremo · central' : null,
      },
    ]
    const extras = [
      {
        label: 'Widths por panel',
        value: fmtPerPanel('widthsPerPanel', 1),
        hint: multiKind ? 'extremo / central' : null,
      },
      {
        label: 'Anillos aprox.',
        value: approxRings,
        hint: '(aproximado — confirmar con proveedor)',
      },
    ]

    setResult({
      widthsNeeded: totalWidths.toFixed(1),
      cutLength: cutLength.toFixed(2),
      totalYardage: breakdown.total.toFixed(2),
      breakdown: {
        needed: breakdown.needed.toFixed(2),
        overage: breakdown.overage.toFixed(2),
        total: breakdown.total.toFixed(2),
      },
      primaryExtras,
      extras,
      note:
        `${pleatStyle === 'pinch' ? 'Pinch' : 'French'} pleat · ${panelSummary}. ` +
        `Hem ${HEM_PLEATED}" incluido en cut length. ` +
        `Las costuras deben caer al lado o entre pleats, nunca dentro.` +
        repeatNote,
    })
  }

  return (
    <div className="calc-form">
      <ButtonGroup
        label="Pleat style"
        value={pleatStyle}
        onChange={setPleatStyle}
        options={PLEAT_STYLE_OPTIONS}
        columns={2}
        note="Estilo visual — no afecta el cálculo."
      />

      <div className="grid-2">
        <NumberField
          label="Rod size"
          suffix="in"
          value={rodSize}
          onChange={setRodSize}
        />
        <SelectField
          label="Number of panels"
          value={panels}
          onChange={setPanels}
          options={PANEL_OPTIONS}
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
          label="Finished length"
          suffix="in"
          value={finishedLength}
          onChange={setFinishedLength}
        />
      </div>

      <ButtonGroup
        label="Return size"
        value={returnChoice}
        onChange={setReturnChoice}
        options={RETURN_OPTIONS}
        columns={3}
      />

      {returnChoice === 'custom' && (
        <NumberField
          label="Custom return"
          suffix="in"
          value={customReturn}
          onChange={setCustomReturn}
        />
      )}

      <div className="grid-2">
        <ReadOnlyField label="Leading edge" value={OVERLAP} suffix="in (fijo)" />
        <ReadOnlyField label="Hem allowance" value={HEM_PLEATED} suffix="in (fijo)" />
      </div>

      <PatternRepeatToggle checked={hasRepeat} onChange={setHasRepeat} />

      {hasRepeat && (
        <div className="repeat-fields">
          <NumberField
            label="Vertical repeat"
            suffix="in"
            value={vRepeat}
            onChange={setVRepeat}
          />
        </div>
      )}

      <CalculateButton onClick={calculate} />
      <Results data={result} />
    </div>
  )
}

function RippleFoldForm() {
  const [fullness, setFullness] = useState('100')
  const [trackSize, setTrackSize] = useState('72')
  const [panels, setPanels] = useState('2')
  const [fabricWidth, setFabricWidth] = useState('54')
  const [returnChoice, setReturnChoice] = useState('4')
  const [customReturn, setCustomReturn] = useState('')
  const [finishedLength, setFinishedLength] = useState('96')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [vRepeat, setVRepeat] = useState('')
  const [result, setResult] = useState(null)

  function calculate() {
    const track = parseFloat(trackSize) || 0
    const p = parseInt(panels, 10) || 0
    const fw = parseFloat(fabricWidth) || 0
    const fl = parseFloat(finishedLength) || 0
    const ret =
      returnChoice === 'custom' ? parseFloat(customReturn) || 0 : parseFloat(returnChoice)
    const spacing = CARRIER_SPACING[parseInt(fullness, 10)] ?? CARRIER_SPACING[100]

    if (!track || !p || !fw || !fl) {
      setResult({
        widthsNeeded: '—',
        cutLength: '—',
        totalYardage: '—',
        note: 'Completa todos los campos para calcular.',
      })
      return
    }

    const baseCarriers = roundUpToEven(track / spacing)
    const carriersWithBuffer = baseCarriers + 2 * p
    const snapTape = carriersWithBuffer * 4.25 + 8.5 * p
    const sideHems = 3 * 2 * p
    const returnsTotal = ret * p
    const totalInches = snapTape + sideHems + returnsTotal
    const widthsNeeded = Math.ceil(totalInches / fw)

    const baseCut = fl + HEM_RIPPLE
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalFabricInches = widthsNeeded * cutLength
    const breakdown = buildBreakdown(totalFabricInches)
    const totalSnapButtons = baseCarriers + 4 * p

    setResult({
      widthsNeeded: widthsNeeded.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: breakdown.total.toFixed(2),
      breakdown: {
        needed: breakdown.needed.toFixed(2),
        overage: breakdown.overage.toFixed(2),
        total: breakdown.total.toFixed(2),
      },
      extras: [
        {
          label: 'Snap buttons',
          value: totalSnapButtons,
          hint: 'Incluye 2 buffer + 2 master por panel',
        },
      ],
      note:
        `Fullness ${fullness}% · spacing ${toEighthFraction(spacing)}" → ${baseCarriers} carriers base (par). ` +
        `Snap tape ${snapTape.toFixed(2)}" + hems ${sideHems}" + returns ${returnsTotal}" = ${totalInches.toFixed(2)}" ÷ ${fw}" = ${widthsNeeded} widths.` +
        repeatNote,
    })
  }

  return (
    <div className="calc-form">
      <ButtonGroup
        label="Fullness"
        value={fullness}
        onChange={setFullness}
        options={FULLNESS_OPTIONS}
        columns={4}
      />

      <div className="grid-2">
        <NumberField
          label="Track size"
          suffix="in"
          value={trackSize}
          onChange={setTrackSize}
        />
        <SelectField
          label="Number of panels"
          value={panels}
          onChange={setPanels}
          options={PANEL_OPTIONS}
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
          label="Finished length"
          suffix="in"
          value={finishedLength}
          onChange={setFinishedLength}
        />
      </div>

      <ButtonGroup
        label="Return size"
        value={returnChoice}
        onChange={setReturnChoice}
        options={RETURN_OPTIONS}
        columns={3}
      />

      {returnChoice === 'custom' && (
        <NumberField
          label="Custom return"
          suffix="in"
          value={customReturn}
          onChange={setCustomReturn}
        />
      )}

      <div className="grid-2">
        <ReadOnlyField label="Overlap" value={OVERLAP} suffix="in (fijo)" />
        <ReadOnlyField
          label="Hem allowance"
          value={HEM_RIPPLE}
          suffix={`in (${HEM_RIPPLE - 3} bottom + 3 top)`}
        />
      </div>

      <PatternRepeatToggle checked={hasRepeat} onChange={setHasRepeat} />

      {hasRepeat && (
        <div className="repeat-fields">
          <NumberField
            label="Vertical repeat"
            suffix="in"
            value={vRepeat}
            onChange={setVRepeat}
          />
        </div>
      )}

      <CalculateButton onClick={calculate} />
      <Results data={result} />
    </div>
  )
}

export default function DrapesCalculator() {
  const [curtainType, setCurtainType] = useState(null)
  const [type, setType] = useState(null)
  const [functionalKind, setFunctionalKind] = useState(null)

  function resetAll() {
    setCurtainType(null)
    setType(null)
    setFunctionalKind(null)
  }

  return (
    <div className="drapes-flow">
      <div className="step-group">
        <span className="step-label">¿Qué tipo de cortina?</span>
        <div className="big-choice">
          <button
            type="button"
            className={`big-choice-btn ${curtainType === 'regulares' ? 'big-choice-active' : ''}`}
            onClick={() => setCurtainType('regulares')}
          >
            <span className="big-choice-title">Cortinas regulares</span>
            <span className="big-choice-sub">Funcionales o decorativas</span>
          </button>
          <button
            type="button"
            disabled
            title="Próximamente"
            className="big-choice-btn big-choice-disabled"
          >
            <span className="big-choice-title">Café Curtains</span>
            <span className="big-choice-sub">Próximamente</span>
          </button>
        </div>
      </div>

      {curtainType === 'regulares' && (
        <div className="step-group">
          <span className="step-label">¿Cómo funciona la cortina?</span>
          <div className="big-choice">
            <button
              type="button"
              className={`big-choice-btn ${type === 'functional' ? 'big-choice-active' : ''}`}
              onClick={() => {
                setType('functional')
                setFunctionalKind(null)
              }}
            >
              <span className="big-choice-title">Functional</span>
              <span className="big-choice-sub">Cortinas operables</span>
            </button>
            <button
              type="button"
              className={`big-choice-btn ${type === 'stationary' ? 'big-choice-active' : ''}`}
              onClick={() => {
                setType('stationary')
                setFunctionalKind(null)
              }}
            >
              <span className="big-choice-title">Stationary</span>
              <span className="big-choice-sub">Decorativos, fijos</span>
            </button>
          </div>
        </div>
      )}

      {curtainType === 'regulares' && type === 'stationary' && (
        <StationaryForm key="stationary" />
      )}

      {curtainType === 'regulares' && type === 'functional' && (
        <div className="step-group">
          <span className="step-label">¿Qué sistema?</span>
          <div className="big-choice">
            <button
              type="button"
              className={`big-choice-btn ${functionalKind === 'rings' ? 'big-choice-active' : ''}`}
              onClick={() => setFunctionalKind('rings')}
            >
              <span className="big-choice-title">Rings &amp; Carriers</span>
              <span className="big-choice-sub">Anillos sobre carriers</span>
            </button>
            <button
              type="button"
              className={`big-choice-btn ${functionalKind === 'ripple' ? 'big-choice-active' : ''}`}
              onClick={() => setFunctionalKind('ripple')}
            >
              <span className="big-choice-title">Ripple Fold</span>
              <span className="big-choice-sub">Snap tape sobre track</span>
            </button>
          </div>
        </div>
      )}

      {curtainType === 'regulares' && type === 'functional' && functionalKind === 'rings' && (
        <RingsCarriersForm key="rings" />
      )}
      {curtainType === 'regulares' && type === 'functional' && functionalKind === 'ripple' && (
        <RippleFoldForm key="ripple" />
      )}

      {curtainType && (
        <button type="button" className="link-button" onClick={resetAll}>
          ← Cambiar tipo de cortina
        </button>
      )}
    </div>
  )
}
