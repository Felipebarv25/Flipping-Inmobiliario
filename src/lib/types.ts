export type ProjectStatus = 'prospecto' | 'negociando' | 'comprado' | 'en-obra' | 'en-venta' | 'vendido'

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  prospecto: { label: 'Prospecto', color: '#8B8D97' },
  negociando: { label: 'Negociando', color: '#3B7DD8' },
  comprado: { label: 'Comprado', color: '#D97B2B' },
  'en-obra': { label: 'En obra', color: '#B8880D' },
  'en-venta': { label: 'En venta', color: '#8B5CF6' },
  vendido: { label: 'Vendido', color: '#1B7B4C' },
}

export interface ObraItems {
  paredes: number
  pisos: number
  cocina: number
  banos_obra: number
  electrica: number
  plomeria: number
  pintura: number
  carpinteria: number
  ventanas: number
  fachada: number
  aseo: number
  otros: number
}

export interface Financials {
  precio_compra: number
  arv: number
  obra: ObraItems
  imprevistos: number
  meses: number
  admin_mensual: number
  predial_mensual: number
  servicios_mensual: number
  pct_trans_compra: number
  pct_trans_venta: number
  pct_comision: number
  pct_impuesto: number
}

export interface Project {
  id: string
  name: string
  address: string
  city: string
  barrio: string
  estrato: number | null
  area: number | null
  rooms: number | null
  baths: number | null
  matricula: string
  status: ProjectStatus
  notes: string
  date_acquisition: string | null
  date_obra_start: string | null
  date_obra_end: string | null
  date_publication: string | null
  date_sold: string | null
  financials: Financials
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  order_index: number
  created_at: string
}

export const DEFAULT_FINANCIALS: Financials = {
  precio_compra: 0,
  arv: 0,
  obra: {
    paredes: 0, pisos: 0, cocina: 0, banos_obra: 0,
    electrica: 0, plomeria: 0, pintura: 0, carpinteria: 0,
    ventanas: 0, fachada: 0, aseo: 0, otros: 0,
  },
  imprevistos: 0,
  meses: 6,
  admin_mensual: 0,
  predial_mensual: 0,
  servicios_mensual: 0,
  pct_trans_compra: 2,
  pct_trans_venta: 1.3,
  pct_comision: 3,
  pct_impuesto: 15,
}

export const OBRA_LABELS: Record<keyof ObraItems, string> = {
  paredes: 'Demolición y paredes',
  pisos: 'Pisos y enchapes',
  cocina: 'Cocina integral',
  banos_obra: 'Baños',
  electrica: 'Instalación eléctrica',
  plomeria: 'Plomería y tubería',
  pintura: 'Pintura general',
  carpinteria: 'Carpintería y puertas',
  ventanas: 'Ventanas y vidrios',
  fachada: 'Fachada y exteriores',
  aseo: 'Aseo y escombros',
  otros: 'Otros gastos',
}
