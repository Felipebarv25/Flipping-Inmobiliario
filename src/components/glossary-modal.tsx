'use client'

import { useEffect, useRef } from 'react'
import { GLOSSARY } from '@/lib/glossary'

interface Props {
  open: boolean
  onClose: () => void
}

export default function GlossaryModal({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className="bg-white dark:bg-[#1A1E24] rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Glosario Inmobiliario
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-4">
          {GLOSSARY.map(g => (
            <div key={g.term}>
              <h3 className="font-bold text-emerald-brand text-sm">{g.term}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: g.def }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
