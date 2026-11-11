'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    startTransition(async () => {
      const result = await signIn('credentials', {
        email: String(email),
        password: String(password),
        redirect: false,
      })

      if (result?.error) {
        setError('Credenciales inválidas. Verifica tu correo o contraseña.')
      } else {
        redirect('/admin')
      }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">Acceso Administrativo</h1>
          <p className="text-xs text-neutral-400 mt-1">Ingresa tus credenciales para gestionar el panel de Carta Menú</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@cartamenu.com"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 rounded-xl p-3 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 rounded-xl p-3 text-sm outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition mt-2 disabled:opacity-50"
          >
            {isPending ? 'Validando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}