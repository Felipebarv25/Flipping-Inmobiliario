'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Project, DEFAULT_FINANCIALS } from '@/lib/types'
import ProjectForm from '@/components/project-form'

const emptyProject: Project = {
  id: '',
  name: '',
  address: '',
  city: '',
  barrio: '',
  estrato: null,
  area: null,
  rooms: null,
  baths: null,
  matricula: '',
  status: 'prospecto',
  notes: '',
  date_acquisition: null,
  date_obra_start: null,
  date_obra_end: null,
  date_publication: null,
  date_sold: null,
  financials: DEFAULT_FINANCIALS,
  created_at: '',
  updated_at: '',
}

export default function NewProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async (project: Project) => {
    setSaving(true)
    try {
      const { id, created_at, updated_at, ...data } = project
      const { data: inserted, error } = await supabase
        .from('projects')
        .insert(data)
        .select('id')
        .single()

      if (error) {
        alert('Error al guardar: ' + error.message)
        return
      }
      router.push(`/proyecto/${inserted.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[980px] mx-auto px-5 pb-10">
      <div className="flex items-center justify-between py-4 mb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-[#F6F5F1] dark:bg-[#0F1215]">
        <button onClick={() => router.push('/')} className="text-emerald-brand font-semibold text-sm hover:underline">
          ← Portafolio
        </button>
        <span className="font-bold text-lg" style={{ fontFamily: 'Georgia, serif' }}>Nueva propiedad</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => { if (confirm('¿Seguro que desea descartar esta propiedad?')) router.push('/') }} className="px-3 py-2 rounded-lg font-semibold text-sm border text-danger border-danger transition hover:bg-danger hover:text-white">
            Eliminar
          </button>
          <button type="submit" form="project-form" disabled={saving} className="px-5 py-2 bg-emerald-brand text-white rounded-lg font-semibold text-sm hover:bg-emerald-hover transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      <ProjectForm project={emptyProject} images={[]} onSave={handleSave} onImagesChange={() => {}} isNew saving={saving} />
    </div>
  )
}
