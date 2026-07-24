'use client'

import { CalcResult, formatCOP } from '@/lib/calc'

interface Props {
  result: CalcResult
  hasData: boolean
}

const VERDICT_STYLES = {
  rentable: { bg: 'bg-emerald-light dark:bg-emerald-900/30', badge: 'bg-emerald-brand', text: 'text-emerald-brand' },
  ajustado: { bg: 'bg-warn-bg dark:bg-yellow-900/20', badge: 'bg-warn', text: 'text-warn' },
  bajo: { bg: 'bg-danger-bg dark:bg-red-900/20', badge: 'bg-danger', text: 'text-danger' },
  pierde: { bg: 'bg-danger-bg dark:bg-red-900/20', badge: 'bg-danger', text: 'text-danger' },
}

export default function VerdictPanel({ result, hasData }: Props) {
  const s = VERDICT_STYLES[result.verdict]

  return (
    <div className="space-y-4 sticky top-20">
      {/* Verdict */}
      <div className={`rounded-xl p-5 text-center border border-gray-200 dark:border-gray-700 ${hasData ? s.bg : 'bg-gray-100 dark:bg-gray-800'}`}>
        {hasData ? (
          <>
            <span className={`inline-block px-3 py-1 rounded-full text-white text-[10px] font-extrabold tracking-wider ${s.badge}`}>
              {result.verdictLabel}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wide">Utilidad Neta</p>
            <p className={`text-3xl font-bold mt-1 tabular-nums ${s.text}`} style={{ fontFamily: 'Georgia, serif' }}>
              {formatCOP(result.utilidadNeta)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ROI: <b>{result.roi.toFixed(1)}%</b> · Anualizado: <b>{result.roiAnualizado.toFixed(1)}%</b>
            </p>
          </>
        ) : (
          <>
            <span className="inline-block px-3 py-1 rounded-full bg-gray-300 dark:bg-gray-600 text-white text-[10px] font-extrabold tracking-wider">
              INGRESA DATOS
            </span>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">Utilidad Neta</p>
            <p className="text-2xl text-gray-400 mt-1">—</p>
          </>
        )}
      </div>

      {/* 70% Rule */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Regla del 70%</h3>
        {hasData ? (
          <>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white ${result.cumple70 ? 'bg-emerald-brand' : 'bg-danger'}`}>
                {result.cumple70 ? 'CUMPLE' : 'NO CUMPLE'}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Máx: {formatCOP(result.maxCompra70)}</span>
            </div>
            <p className={`text-sm mt-1 ${result.cumple70 ? 'text-emerald-brand' : 'text-danger'}`}>
              {result.cumple70 ? `Estás ${formatCOP(result.diff70)} por debajo` : `Excedes por ${formatCOP(Math.abs(result.diff70))}`}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">Ingresa datos para calcular.</p>
        )}
      </div>

      {/* Financial Breakdown */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Desglose Financiero</h3>
        {hasData ? (
          <div className="space-y-2 text-sm">
            <Row label="Inversión total" value={result.inversionTotal} bold />
            <Row label="Precio compra" value={result.inversionTotal - result.obraConImprevistos - result.transCompra - result.holdingTotal} sub />
            <Row label="Obra + imprevistos" value={result.obraConImprevistos} sub />
            <Row label={`Trans. compra (${((result.transCompra / (result.inversionTotal - result.obraConImprevistos - result.transCompra - result.holdingTotal)) * 100 || 0).toFixed(1)}%)`} value={result.transCompra} sub />
            {result.holdingTotal > 0 && <Row label="Holding" value={result.holdingTotal} sub />}
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label="Costos venta" value={result.costosVenta} bold />
            <Row label="Trans. venta" value={result.transVenta} sub />
            <Row label="Comisión" value={result.comision} sub />
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            <Row label={`Impuesto (${result.impuesto > 0 ? '15%' : '0%'})`} value={result.impuesto} bold />
            <div className="border-t-2 border-emerald-brand/20 my-2" />
            <Row label="Venta (ARV)" value={result.inversionTotal + result.costosVenta + result.impuesto + result.utilidadNeta} bold />
            <Row label="Total egresos" value={result.totalEgresos} bold color="text-danger" />
            <Row label="Utilidad neta" value={result.utilidadNeta} bold color={result.utilidadNeta >= 0 ? 'text-emerald-brand' : 'text-danger'} big />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Los resultados aparecerán aquí.</p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold, sub, color, big }: { label: string; value: number; bold?: boolean; sub?: boolean; color?: string; big?: boolean }) {
  return (
    <div className={`flex justify-between items-baseline ${sub ? 'pl-3 text-gray-500 dark:text-gray-500 text-xs' : ''}`}>
      <span className={bold ? 'font-semibold' : ''}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold' : ''} ${color || ''} ${big ? 'text-base' : ''}`} style={big ? { fontFamily: 'Georgia, serif' } : {}}>
        {formatCOP(value)}
      </span>
    </div>
  )
}
