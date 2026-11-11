'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordPage({ params }) {
  const { token } = params
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessageType('success')
        setMessage(data.message || 'Contraseña restablecida correctamente.')
        setPassword('')
        setConfirmPassword('')
      } else {
        setMessageType('error')
        setMessage(data.error || 'Error al restablecer la contraseña.')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 font-bold text-sm mb-2 block">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Cambiar contraseña
          </h1>
          <p className="text-xs text-neutral-400">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium ${
            messageType === 'success'
              ? 'bg-green-950/50 border border-green-800/80 text-green-300'
              : 'bg-rose-950/50 border border-rose-800/80 text-rose-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Nueva contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 rounded-xl p-3 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 rounded-xl p-3 text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}