'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { ProjectImage } from '@/lib/types'

interface Props {
  projectId: string
  images: ProjectImage[]
  onImagesChange: (images: ProjectImage[]) => void
}

export default function ImageGallery({ projectId, images, onImagesChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)

    for (const file of Array.from(files)) {
      if (images.length >= 8) break

      const ext = file.name.split('.').pop()
      const path = `${projectId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(path)

      const { data, error } = await supabase
        .from('project_images')
        .insert({ project_id: projectId, url: publicUrl, order_index: images.length })
        .select()
        .single()

      if (!error && data) {
        onImagesChange([...images, data])
      }
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (img: ProjectImage) => {
    const urlParts = img.url.split('/project-images/')
    if (urlParts[1]) {
      await supabase.storage.from('project-images').remove([urlParts[1]])
    }
    await supabase.from('project_images').delete().eq('id', img.id)
    onImagesChange(images.filter(i => i.id !== img.id))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || images.length >= 8}
          className="px-4 py-2 text-sm font-semibold text-emerald-brand bg-emerald-light dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition disabled:opacity-50"
        >
          {uploading ? 'Subiendo...' : '+ Agregar fotos'}
        </button>
        <span className="text-xs text-gray-400">{images.length}/8 fotos</span>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
