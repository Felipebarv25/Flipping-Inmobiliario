'use client'

import { useState, useCallback } from 'react'

interface Props {
  value: number
  onChange: (val: number) => void
  placeholder?: string
  className?: string
}

export default function CurrencyInput({ value, onChange, placeholder = '$', className = '' }: Props) {
  const [focused, setFocused] = useState(false)

  const format = useCallback((n: number) => {
    if (!n) return ''
    return '$' + Math.round(n).toLocaleString('es-CO')
  }, [])

  const parse = useCallback((s: string) => {
    return parseInt(s.replace(/\./g, '').replace(/[^\d]/g, ''), 10) || 0
  }, [])

  return (
    <input
      type="text"
      inputMode="numeric"
      className={`w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1E222A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-brand/40 focus:border-emerald-brand transition tabular-nums ${className}`}
      placeholder={placeholder}
      value={focused ? (value || '') : format(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={e => {
        const raw = parse(e.target.value)
        onChange(raw)
      }}
    />
  )
}
