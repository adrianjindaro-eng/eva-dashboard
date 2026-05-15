import { useState } from 'react'
import {
  HEM_ALLOWANCE,
  OVERLAP,
  ButtonGroup,
  CalculateButton,
  NumberField,
  PatternRepeatToggle,
  ReadOnlyField,
  Results,
  SelectField,
  ceilYards,
  roundUpToEven,
  roundUpToHalf,
  roundUpToMultiple,
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

    const baseCut = fl + HEM_ALLOWANCE
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalYards = (widthsNeeded * cutLength) / 36
    const yardsRounded = ceilYards(totalYards)

    const adjustmentNote =
      fw === 54
        ? ''
        : ` Widths/panel ajustados a tela de ${fw}" (referencia 54").`

    setResult({
      widthsNeeded: widthsNeeded.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: yardsRounded.toFixed(2),
      note:
        `${p} panel${p === 1 ? '' : 'es'} · ${wpp} width(s)/panel · hem ${HEM_ALLOWANCE}" incluido.` +
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

      <ReadOnlyField label="Hem allowance" value={HEM_ALLOWANCE} suffix="in (fijo)" />

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

function RingsCarriersForm() {
  const [rodSize, setRodSize] = useState('72')
  const [panels, setPanels] = useState('2')
  const [fabricWidth, setFabricWidth] = useState('54')
  const [returnChoice, setReturnChoice] = useState('4')
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

    const sideHems = 3 * 2 * p
    const returnsTotal = ret * p
    const totalInches = rod * 2.5 + sideHems + returnsTotal
    const widthsRaw = totalInches / fw
    const widthsNeeded = roundUpToHalf(widthsRaw)

    const baseCut = fl + HEM_ALLOWANCE
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalYards = (widthsNeeded * cutLength) / 36
    const yardsRounded = ceilYards(totalYards)
    const approxRings = Math.round(widthsNeeded * 5)

    setResult({
      widthsNeeded: widthsNeeded.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: yardsRounded.toFixed(2),
      extras: [
        {
          label: 'Anillos aprox.',
          value: approxRings,
          hint: '(aproximado — confirmar con proveedor)',
        },
      ],
      note:
        `Rod ${rod}" × 2.5 = ${(rod * 2.5).toFixed(2)}" + hems ${sideHems}" + returns ${returnsTotal}". ` +
        `Total ${totalInches.toFixed(2)}" ÷ ${fw}" = ${widthsRaw.toFixed(2)} → ${widthsNeeded} widths (half-width).` +
        repeatNote,
    })
  }

  return (
    <div className="calc-form">
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
        <ReadOnlyField label="Overlap" value={OVERLAP} suffix="in (fijo)" />
        <ReadOnlyField label="Hem allowance" value={HEM_ALLOWANCE} suffix="in (fijo)" />
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

    const baseCut = fl + HEM_ALLOWANCE
    const { length: cutLength, note: repeatNote } = applyVerticalRepeat(
      baseCut,
      hasRepeat,
      vRepeat,
    )

    const totalYards = (widthsNeeded * cutLength) / 36
    const yardsRounded = ceilYards(totalYards)
    const totalSnapButtons = baseCarriers + 4 * p

    setResult({
      widthsNeeded: widthsNeeded.toString(),
      cutLength: cutLength.toFixed(2),
      totalYardage: yardsRounded.toFixed(2),
      extras: [
        {
          label: 'Snap buttons',
          value: totalSnapButtons,
          hint: 'Incluye 2 buffer + 2 master por panel',
        },
      ],
      note:
        `Fullness ${fullness}% · spacing ${spacing}" → ${baseCarriers} carriers base (par). ` +
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
        <ReadOnlyField label="Hem allowance" value={HEM_ALLOWANCE} suffix="in (fijo)" />
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
