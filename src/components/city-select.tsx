'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { COLOMBIA_CITIES } from '@/lib/colombia-cities'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function CitySelect({ value, onChange }: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [highlighted, setHighlighted] = useState(-1)

  const filtered = useMemo(() => {
    if (!query.trim()) return COLOMBIA_CITIES.slice(0, 30)
    const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    return COLOMBIA_CITIES.filter(c => {
      const text = `${c.city} ${c.dept}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      return text.includes(q)
    }).slice(0, 30)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        if (!value) setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const el = listRef.current.children[highlighted] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  const select = (city: string) => {
    onChange(city)
    setQuery(city)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === 'ArrowDown') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(filtered[highlighted].city) }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        className="input-base"
        placeholder="Buscar ciudad o municipio..."
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHighlighted(-1); if (!e.target.value) onChange('') }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-[#1E222A] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          {filtered.map((c, i) => (
            <li
              key={`${c.city}-${c.dept}`}
              onMouseDown={() => select(c.city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-3 py-2 cursor-pointer text-sm flex justify-between ${
                i === highlighted ? 'bg-emerald-light dark:bg-emerald-900/30 text-emerald-brand' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="font-medium">{c.city}</span>
              <span className="text-xs text-gray-400">{c.dept}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
