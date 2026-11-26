'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, {
    success: false,
    error: null,
    message: null,
  })

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 font-bold text-sm mb-2 block">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Recuperar contraseña
          </h1>
          <p className="text-xs text-neutral-400">
            Ingresá tu correo y te enviaremos un enlace para restablecerla
          </p>
        </div>

        {state?.error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-sm font-medium text-center">
            {state.error}
          </div>
        )}

        {state?.success && state?.message && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm font-medium text-center">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-4">
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition"
          >
            {isPending ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-semibold text-sm"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}