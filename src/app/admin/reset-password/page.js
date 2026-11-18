'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setType('success')
        setMessage('Contraseña actualizada correctamente.')
        setEmail('')
        setNewPassword('')
      } else {
        setType('error')
        setMessage(data.error || 'No se pudo actualizar la contraseña.')
      }
    } catch (error) {
      setType('error')
      setMessage('Error de conexión. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <Link href="/admin" className="text-amber-500 hover:text-amber-400 font-bold text-sm mb-4 block">
          ← Volver al panel
        </Link>
        <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
          Resetear contraseña
        </h1>
        <p className="text-xs text-neutral-400 mb-6">
          Ingresá el email de la cuenta y la nueva contraseña.
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium ${
              type === 'success'
                ? 'bg-emerald-950/50 border border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/50 border border-rose-800/80 text-rose-300'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Email de la cuenta
            </label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tu-restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Nueva contraseña
            </label>
            <input
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition"
          >
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
