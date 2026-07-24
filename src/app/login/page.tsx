'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { signIn, signUp, loading, user } = useAuth()
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  if (user) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    if (isRegister) {
      const { error } = await signUp(email, password)
      if (error) setError(error)
      else setSuccess('Revisa tu email para confirmar tu cuenta.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else router.push('/')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F6F5F1] dark:bg-[#0F1215]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Flipping Portfolio
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de inversiones inmobiliarias
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1A1E24] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-light dark:bg-emerald-900/20 text-emerald-brand text-sm p-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1E222A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-brand/40 focus:border-emerald-brand transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1E222A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-brand/40 focus:border-emerald-brand transition"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-brand text-white rounded-lg font-semibold hover:bg-emerald-hover transition disabled:opacity-50"
          >
            {submitting ? 'Cargando...' : isRegister ? 'Registrarse' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }} className="text-emerald-brand font-semibold hover:underline">
              {isRegister ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
