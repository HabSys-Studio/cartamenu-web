'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
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
        window.location.href = '/admin'
      }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 font-bold text-sm mb-2 block">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Iniciar sesión
          </h1>
          <p className="text-xs text-neutral-400">
            Acceso al panel de administración de tu restaurante
          </p>
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
              name="email"
              type="email"
              required
              placeholder="admin@tu-restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-neutral-100 rounded-xl p-3 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
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

        <div className="mt-8 pt-6 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 text-center mb-4">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Regístrate gratis
            </Link>
          </p>
          <p className="text-xs text-neutral-500 text-center">
            ¿Olvidaste tu contraseña?{' '}
            <Link
              href="/forgot-password"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Recuperarla aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}