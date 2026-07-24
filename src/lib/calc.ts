import { Financials, ObraItems } from './types'

export interface CalcResult {
  obraTotal: number
  obraConImprevistos: number
  transCompra: number
  transVenta: number
  comision: number
  holdingTotal: number
  inversionTotal: number
  costosVenta: number
  impuesto: number
  totalEgresos: number
  utilidadNeta: number
  roi: number
  roiAnualizado: number
  maxCompra70: number
  cumple70: boolean
  diff70: number
  verdict: 'rentable' | 'ajustado' | 'bajo' | 'pierde'
  verdictLabel: string
}

export function sumObra(obra: ObraItems): number {
  return Object.values(obra).reduce((s, v) => s + (v || 0), 0)
}

export function calculate(f: Financials): CalcResult {
  const obraTotal = sumObra(f.obra)
  const imprevistosVal = obraTotal * (f.imprevistos / 100)
  const obraConImprevistos = obraTotal + imprevistosVal

  const transCompra = f.precio_compra * (f.pct_trans_compra / 100)
  const holdingMensual = (f.admin_mensual || 0) + (f.predial_mensual || 0) + (f.servicios_mensual || 0)
  const holdingTotal = holdingMensual * (f.meses || 0)

  const inversionTotal = f.precio_compra + obraConImprevistos + transCompra + holdingTotal

  const transVenta = f.arv * (f.pct_trans_venta / 100)
  const comision = f.arv * (f.pct_comision / 100)
  const costosVenta = transVenta + comision

  const ganancia = f.arv - inversionTotal - costosVenta
  const impuesto = ganancia > 0 ? ganancia * (f.pct_impuesto / 100) : 0

  const totalEgresos = inversionTotal + costosVenta + impuesto
  const utilidadNeta = f.arv - totalEgresos

  const roi = inversionTotal > 0 ? (utilidadNeta / inversionTotal) * 100 : 0
  const meses = f.meses || 1
  const roiAnualizado = roi * (12 / meses)

  const maxCompra70 = f.arv * 0.7 - obraConImprevistos
  const cumple70 = f.precio_compra <= maxCompra70
  const diff70 = maxCompra70 - f.precio_compra

  let verdict: CalcResult['verdict'] = 'pierde'
  let verdictLabel = 'PIERDE DINERO'
  if (utilidadNeta < 0) {
    verdict = 'pierde'
    verdictLabel = 'PIERDE DINERO'
  } else if (roi >= 15) {
    verdict = 'rentable'
    verdictLabel = 'DEAL RENTABLE'
  } else if (roi >= 5) {
    verdict = 'ajustado'
    verdictLabel = 'DEAL AJUSTADO'
  } else {
    verdict = 'bajo'
    verdictLabel = 'MARGEN BAJO'
  }

  return {
    obraTotal, obraConImprevistos, transCompra, transVenta, comision,
    holdingTotal, inversionTotal, costosVenta, impuesto, totalEgresos,
    utilidadNeta, roi, roiAnualizado, maxCompra70, cumple70, diff70,
    verdict, verdictLabel,
  }
}

export function formatCOP(n: number): string {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(Math.round(n))
  return sign + '$' + abs.toLocaleString('es-CO')
}

export function formatShort(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return '$' + (n / 1e9).toFixed(1).replace('.0', '') + 'B'
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M'
  if (abs >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K'
  return '$' + Math.round(n).toLocaleString('es-CO')
}
