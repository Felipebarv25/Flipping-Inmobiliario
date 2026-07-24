'use client'

import { useState, useMemo } from 'react'
import { Project, ProjectImage, ProjectStatus, STATUS_CONFIG, DEFAULT_FINANCIALS, Financials, ObraItems, OBRA_LABELS } from '@/lib/types'
import { calculate, formatCOP } from '@/lib/calc'
import CurrencyInput from './currency-input'
import VerdictPanel from './verdict-panel'
import ImageGallery from './image-gallery'
import CitySelect from './city-select'

interface Props {
  project: Project
  images: ProjectImage[]
  onSave: (project: Project) => Promise<void>
  onDelete?: () => Promise<void>
  onImagesChange: (images: ProjectImage[]) => void
  isNew: boolean
}

export default function ProjectForm({ project, images, onSave, onDelete, onImagesChange, isNew }: Props) {
  const [form, setForm] = useState<Project>(project)
  const [saving, setSaving] = useState(false)
  const [delStep, setDelStep] = useState(0)
  const [obraOpen, setObraOpen] = useState(false)
  const [notes, setNotes] = useState(project.notes || '')

  const f = form.financials || DEFAULT_FINANCIALS
  const result = useMemo(() => calculate(f), [f])
  const hasData = f.precio_compra > 0 || f.arv > 0

  const set = (field: keyof Project, value: unknown) => setForm(p => ({ ...p, [field]: value }))

  const setFin = (field: keyof Financials, value: number) => {
    setForm(p => ({ ...p, financials: { ...(p.financials || DEFAULT_FINANCIALS), [field]: value } }))
  }

  const setObra = (field: keyof ObraItems, value: number) => {
    setForm(p => ({
      ...p,
      financials: {
        ...(p.financials || DEFAULT_FINANCIALS),
        obra: { ...(p.financials?.obra || DEFAULT_FINANCIALS.obra), [field]: value },
      },
    }))
  }

  const obraTotal = useMemo(() => {
    const obra = f.obra || DEFAULT_FINANCIALS.obra
    return Object.values(obra).reduce((s, v) => s + (v || 0), 0)
  }, [f.obra])

  const handleSave = async () => {
    if (!form.name.trim()) { alert('El nombre del proyecto es obligatorio.'); return }
    setSaving(true)
    await onSave({ ...form, notes })
    setSaving(false)
  }

  const handleDelete = async () => {
    if (delStep === 0) { setDelStep(1); return }
    if (onDelete) await onDelete()
  }

  const transCompra = f.precio_compra * (f.pct_trans_compra / 100)
  const transVenta = f.arv * (f.pct_trans_venta / 100)
  const comision = f.arv * (f.pct_comision / 100)
  const ganancia = f.arv - (f.precio_compra + result.obraConImprevistos + transCompra + result.holdingTotal) - transVenta - comision
  const impuesto = ganancia > 0 ? ganancia * (f.pct_impuesto / 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_370px] gap-6 items-start">
      {/* Left column - Inputs */}
      <div className="space-y-5">
        {/* Project Info */}
        <Section title="Información del proyecto">
          <div className="space-y-3">
            <Field label="Nombre del proyecto *" full>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Apto Cedritos 401" className="input-base" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dirección"><input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Cra 15 #134-20" className="input-base" /></Field>
              <Field label="Ciudad / Municipio"><CitySelect value={form.city} onChange={v => set('city', v)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Barrio"><input type="text" value={form.barrio} onChange={e => set('barrio', e.target.value)} placeholder="Cedritos" className="input-base" /></Field>
              <Field label="Estrato"><input type="number" min={1} max={6} value={form.estrato || ''} onChange={e => set('estrato', Number(e.target.value) || null)} className="input-base" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Área (m²)"><input type="number" value={form.area || ''} onChange={e => set('area', Number(e.target.value) || null)} className="input-base" /></Field>
              <Field label="Habitaciones"><input type="number" value={form.rooms || ''} onChange={e => set('rooms', Number(e.target.value) || null)} className="input-base" /></Field>
              <Field label="Baños"><input type="number" value={form.baths || ''} onChange={e => set('baths', Number(e.target.value) || null)} className="input-base" /></Field>
            </div>
            <Field label="Matrícula inmobiliaria" full>
              <input type="text" value={form.matricula} onChange={e => set('matricula', e.target.value)} placeholder="50N-12345" className="input-base" />
            </Field>
          </div>
        </Section>

        {/* Status & Dates */}
        <Section title="Estado y cronograma">
          <div className="space-y-3">
            <Field label="Estado del proyecto" full>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-base">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha de adquisición"><input type="date" value={form.date_acquisition || ''} onChange={e => set('date_acquisition', e.target.value || null)} className="input-base" /></Field>
              <Field label="Inicio de obra"><input type="date" value={form.date_obra_start || ''} onChange={e => set('date_obra_start', e.target.value || null)} className="input-base" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fin de obra"><input type="date" value={form.date_obra_end || ''} onChange={e => set('date_obra_end', e.target.value || null)} className="input-base" /></Field>
              <Field label="Publicación en venta"><input type="date" value={form.date_publication || ''} onChange={e => set('date_publication', e.target.value || null)} className="input-base" /></Field>
            </div>
            <Field label="Fecha de venta" full>
              <input type="date" value={form.date_sold || ''} onChange={e => set('date_sold', e.target.value || null)} className="input-base" />
            </Field>
          </div>
        </Section>

        {/* Photos */}
        <Section title="Fotos">
          {isNew ? (
            <div className="text-center py-6 text-gray-400">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm">Guarda el proyecto primero para agregar fotos.</p>
            </div>
          ) : (
            <ImageGallery projectId={form.id} images={images} onImagesChange={onImagesChange} />
          )}
        </Section>

        {/* Financial - Purchase & ARV */}
        <Section title="Propiedad (Financiero)">
          <div className="space-y-3">
            <Field label="Precio de compra" full><CurrencyInput value={f.precio_compra} onChange={v => setFin('precio_compra', v)} /></Field>
            <Field label="ARV (valor post-reparación)" full><CurrencyInput value={f.arv} onChange={v => setFin('arv', v)} /></Field>
          </div>
        </Section>

        {/* Renovation */}
        <Section title="Renovación">
          <div className="bg-gray-50 dark:bg-[#1E222A] rounded-lg p-3 mb-3">
            <span className="text-xs text-gray-500">Costo total de obra</span>
            <p className="text-xl font-bold tabular-nums" style={{ fontFamily: 'Georgia, serif' }}>
              ${obraTotal.toLocaleString('es-CO')}
            </p>
          </div>
          <button type="button" onClick={() => setObraOpen(!obraOpen)} className="w-full text-center py-2 text-sm font-semibold text-emerald-brand bg-emerald-light dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 transition">
            {obraOpen ? 'Ocultar desglose ▲' : 'Desglosar costos de obra ▼'}
          </button>
          {obraOpen && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {(Object.keys(OBRA_LABELS) as (keyof ObraItems)[]).map(key => (
                <Field key={key} label={OBRA_LABELS[key]}>
                  <CurrencyInput value={f.obra?.[key] || 0} onChange={v => setObra(key, v)} />
                </Field>
              ))}
            </div>
          )}
          <div className="mt-3">
            <Field label="Imprevistos" full>
              <div className="flex items-center gap-2">
                <input type="number" min={0} max={50} value={f.imprevistos} onChange={e => setFin('imprevistos', Number(e.target.value))} className="input-base w-24" />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </Field>
          </div>
        </Section>

        {/* Holding */}
        <Section title="Holding">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Meses hasta la venta"><input type="number" min={1} value={f.meses} onChange={e => setFin('meses', Number(e.target.value))} className="input-base" /></Field>
              <Field label="Admin. mensual"><CurrencyInput value={f.admin_mensual} onChange={v => setFin('admin_mensual', v)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Predial mensual"><CurrencyInput value={f.predial_mensual} onChange={v => setFin('predial_mensual', v)} /></Field>
              <Field label="Servicios mensuales"><CurrencyInput value={f.servicios_mensual} onChange={v => setFin('servicios_mensual', v)} /></Field>
            </div>
          </div>
        </Section>

        {/* Transaction */}
        <Section title="Transacción">
          <div className="grid grid-cols-2 gap-4">
            <TransactionField
              label="Costos compra"
              amount={transCompra}
              pct={f.pct_trans_compra}
              onPctChange={v => setFin('pct_trans_compra', v)}
              basis="del precio de compra"
            />
            <TransactionField
              label="Costos venta"
              amount={transVenta}
              pct={f.pct_trans_venta}
              onPctChange={v => setFin('pct_trans_venta', v)}
              basis="del ARV"
            />
            <TransactionField
              label="Comisión inmobiliaria"
              amount={comision}
              pct={f.pct_comision}
              onPctChange={v => setFin('pct_comision', v)}
              basis="del ARV"
            />
            <TransactionField
              label="Impuesto ganancia"
              amount={impuesto}
              pct={f.pct_impuesto}
              onPctChange={v => setFin('pct_impuesto', v)}
              basis="de la ganancia"
            />
          </div>
        </Section>
      </div>

      {/* Right column - Results */}
      <div className="space-y-4">
        <VerdictPanel result={result} hasData={hasData} />

        {/* Notes */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Notas</h3>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones, contactos, detalles..."
            className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1E222A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-brand/40 resize-y text-sm"
          />
        </div>

        {/* Save/Delete buttons (mobile) */}
        <div className="flex gap-3 lg:hidden">
          {!isNew && onDelete && (
            <button onClick={handleDelete} className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition ${delStep ? 'bg-danger text-white border-danger animate-pulse' : 'text-danger border-danger'}`}>
              {delStep ? '¿Eliminar?' : 'Eliminar'}
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-emerald-brand text-white rounded-lg font-semibold text-sm hover:bg-emerald-hover transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TransactionField({ label, amount, pct, onPctChange, basis }: {
  label: string; amount: number; pct: number; onPctChange: (v: number) => void; basis: string
}) {
  return (
    <div>
      <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <p className="text-base font-bold tabular-nums text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
        {formatCOP(amount)}
      </p>
      <div className="flex items-center gap-1 mt-1">
        <input type="number" step={0.1} min={0} value={pct} onChange={e => onPctChange(Number(e.target.value))} className="w-14 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1E222A] text-gray-600 dark:text-gray-400 text-xs tabular-nums focus:outline-none focus:border-emerald-brand" />
        <span className="text-[10px] text-gray-400">% {basis}</span>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#1A1E24] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-brand mb-4 border-l-2 border-emerald-brand pl-2">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? '' : ''}`}>
      <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  )
}
