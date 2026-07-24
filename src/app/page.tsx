'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Project, STATUS_CONFIG, DEFAULT_FINANCIALS } from '@/lib/types'
import { calculate, formatShort } from '@/lib/calc'
import GlossaryModal from '@/components/glossary-modal'

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [glossaryOpen, setGlossaryOpen] = useState(false)

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
      setProjects(data || [])
      setLoading(false)
    }
    fetchProjects()
  }, [])

  const stats = projects.reduce(
    (acc, p) => {
      const f = p.financials || DEFAULT_FINANCIALS
      const r = calculate(f)
      acc.invested += f.precio_compra
      acc.profit += r.utilidadNeta
      acc.rois.push(r.roi)
      return acc
    },
    { invested: 0, profit: 0, rois: [] as number[] }
  )
  const avgRoi = stats.rois.length ? stats.rois.reduce((a, b) => a + b, 0) / stats.rois.length : 0

  const handleExport = () => {
    if (!projects.length) return
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `flipping-portfolio-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="max-w-[980px] mx-auto px-5 pb-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D4F2F] via-emerald-brand to-[#28A05E] text-white rounded-2xl p-7 mb-7 shadow-lg mt-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Flipping Portfolio</h1>
            <p className="text-sm opacity-80 mt-0.5">Gestión de inversiones inmobiliarias</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <HeroBtn onClick={() => setGlossaryOpen(true)}>Glosario</HeroBtn>
            <HeroBtn onClick={handleExport}>Exportar</HeroBtn>
          </div>
        </div>
        <div className="flex gap-3 mt-5 flex-wrap">
          <Stat value={String(projects.length)} label="Propiedades" />
          <Stat value={formatShort(stats.invested)} label="Invertido" />
          <Stat value={formatShort(stats.profit)} label="Utilidad Est." />
          <Stat value={`${avgRoi.toFixed(1)}%`} label="ROI Prom." />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-brand border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🏠</div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Tu portafolio está vacío</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Agrega tu primera propiedad para comenzar</p>
          <button onClick={() => router.push('/proyecto/nuevo')} className="px-6 py-3 bg-emerald-brand text-white rounded-lg font-semibold hover:bg-emerald-hover transition">
            + Agregar propiedad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => {
            const r = calculate(p.financials || DEFAULT_FINANCIALS)
            const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.prospecto
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/proyecto/${p.id}`)}
                className="bg-white dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <div className="h-36 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl opacity-20 relative">
                  🏠
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-white text-[9px] font-extrabold tracking-wider uppercase" style={{ background: sc.color }}>
                    {sc.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate" style={{ fontFamily: 'Georgia, serif' }}>{p.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{[p.barrio, p.city].filter(Boolean).join(', ') || 'Sin ubicación'}</p>
                  <div className="flex gap-2 mt-3">
                    <MetricCard label="Inversión" value={formatShort(p.financials?.precio_compra || 0)} />
                    <MetricCard label="Utilidad" value={formatShort(r.utilidadNeta)} negative={r.utilidadNeta < 0} />
                    <MetricCard label="ROI" value={`${r.roi.toFixed(1)}%`} negative={r.roi < 0} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-7 right-7 flex items-center gap-2.5 z-50">
        <span className="bg-white dark:bg-[#1A1E24] text-gray-800 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-lg shadow-md cursor-pointer" onClick={() => router.push('/proyecto/nuevo')}>
          Nueva propiedad
        </span>
        <button onClick={() => router.push('/proyecto/nuevo')} className="w-14 h-14 rounded-full bg-emerald-brand text-white text-3xl flex items-center justify-center shadow-lg hover:scale-105 transition">
          +
        </button>
      </div>

      <GlossaryModal open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  )
}

function HeroBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md hover:bg-white/20 transition">
      {children}
    </button>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 min-w-[100px] bg-white/10 backdrop-blur rounded-xl p-3 text-center">
      <span className="text-lg font-bold block tabular-nums" style={{ fontFamily: 'Georgia, serif' }}>{value}</span>
      <span className="text-[10px] opacity-70 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function MetricCard({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex-1 text-center">
      <span className={`text-sm font-bold block tabular-nums ${negative ? 'text-danger' : ''}`}>{value}</span>
      <span className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}
