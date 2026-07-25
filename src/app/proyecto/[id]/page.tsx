'use client'

import { useEffect, useState, useCallback, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Project, ProjectImage } from '@/lib/types'
import ProjectForm from '@/components/project-form'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loadingProject, setLoadingProject] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const saveRef = useRef<(() => void) | null>(null)

  const fetchProject = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (!data) { router.push('/'); return }
    setProject(data)

    const { data: imgs } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', id)
      .order('order_index')
    setImages(imgs || [])
    setLoadingProject(false)
  }, [id, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  if (loadingProject || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-brand border-t-transparent" />
      </div>
    )
  }

  const handleSave = async (updated: Project) => {
    setSaving(true)
    const { id: _, created_at, ...data } = updated
    const { error } = await supabase
      .from('projects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    setSaving(false)
    router.push('/')
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que desea eliminar la propiedad?')) return
    setDeleting(true)
    const { data: imgs } = await supabase
      .from('project_images')
      .select('url')
      .eq('project_id', id)
    if (imgs) {
      const paths = imgs.map(i => {
        const parts = i.url.split('/project-images/')
        return parts[1]
      }).filter(Boolean)
      if (paths.length) await supabase.storage.from('project-images').remove(paths)
    }
    await supabase.from('project_images').delete().eq('project_id', id)
    await supabase.from('projects').delete().eq('id', id)
    router.push('/')
  }

  return (
    <div className="max-w-[980px] mx-auto px-5 pb-10">
      <div className="flex items-center justify-between py-4 mb-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-[#F6F5F1] dark:bg-[#0F1215]">
        <button onClick={() => router.push('/')} className="text-emerald-brand font-semibold text-sm hover:underline">
          ← Portafolio
        </button>
        <span className="font-bold text-lg truncate max-w-[40%] text-center" style={{ fontFamily: 'Georgia, serif' }}>{project.name}</span>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 rounded-lg font-semibold text-sm border text-danger border-danger transition hover:bg-danger hover:text-white disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button type="button" onClick={() => saveRef.current?.()} disabled={saving} className="px-5 py-2 bg-emerald-brand text-white rounded-lg font-semibold text-sm hover:bg-emerald-hover transition disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      <ProjectForm
        project={project}
        images={images}
        onSave={handleSave}
        onDelete={handleDelete}
        onImagesChange={setImages}
        isNew={false}
        saveRef={saveRef}
      />
    </div>
  )
}
