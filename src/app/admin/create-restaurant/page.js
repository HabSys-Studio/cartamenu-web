'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createRestaurantAction } from './actions'

export default function CreateRestaurantPage() {
  const [state, formAction, isPending] = useActionState(createRestaurantAction, {
    error: null,
    success: null,
  })

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/admin"
            className="text-xs text-neutral-400 hover:text-neutral-300 flex items-center gap-1"
          >
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">
            Crear Restaurante
          </h1>
        </div>

        {state?.error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-sm font-medium text-center">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-4 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-center">
            <div className="text-emerald-400 text-2xl mb-2">✅</div>
            <h3 className="text-emerald-300 font-bold mb-2">¡Restaurante creado!</h3>
            <p className="text-emerald-200 text-sm mb-3">
              {state.restaurant.name} ({state.restaurant.slug})
            </p>
            {state.ownerWasCreated && (
              <p className="text-emerald-200 text-xs mb-3">
                Se creó una nueva cuenta para <strong>{state.ownerEmail}</strong>. Compartí las credenciales de acceso.
              </p>
            )}
            <p className="text-emerald-200 text-xs mb-3">
              El propietario podrá iniciar sesión con su email y contraseña.
            </p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Nombre del Restaurante
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue=""
              placeholder="Ej: Mi Pizzería"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Slug (URL del menú)
            </label>
            <input
              name="slug"
              type="text"
              required
              defaultValue=""
              placeholder="Ej: mi-pizzeria"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              El menú estará en: tuapp.vercel.app/mi-pizzeria
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Email del Propietario
            </label>
            <input
              name="ownerEmail"
              type="email"
              required
              defaultValue=""
              placeholder="propietario@restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Si el email no existe, se creará una cuenta nueva automáticamente.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl text-sm font-extrabold transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isPending
                ? 'bg-neutral-600 text-neutral-400'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {isPending ? 'Creando restaurante...' : 'Crear Restaurante'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            Solo el administrador de la plataforma puede crear restaurantes.
          </p>
        </div>
      </div>
    </div>
  )
}