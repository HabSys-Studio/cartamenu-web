'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { registerRestaurant } from './actions'

function PasswordInput({ name, label, placeholder, defaultValue }) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          className="w-full pr-10 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 focus:outline-none"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerRestaurant, {
    error: null,
    success: false,
    emailWarnings: null,
  })

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Registrar tu Restaurante
          </h1>
          <p className="text-xs text-neutral-400">
            Crea tu cuenta de administrador en Carta Menú
          </p>
        </div>

        {state?.error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-sm font-medium text-center">
            {state.error}
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
              defaultValue={state?.formValues?.name ?? ''}
              placeholder="Ej: Mi Pizzería"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Slug (URL de tu menú)
            </label>
            <input
              name="slug"
              type="text"
              required
              defaultValue={state?.formValues?.slug ?? ''}
              placeholder="Ej: mi-pizzeria"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Tu menú estará en: tuapp.vercel.app/mi-pizzeria
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Correo Administrador
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue={state?.formValues?.email ?? ''}
              placeholder="admin@tu-restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Confirmar Correo
            </label>
            <input
              name="confirmEmail"
              type="email"
              required
              defaultValue={state?.formValues?.confirmEmail ?? ''}
              placeholder="admin@tu-restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <PasswordInput
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            defaultValue={state?.formValues?.password ?? ''}
          />

          <PasswordInput
            name="confirmPassword"
            label="Confirmar Contraseña"
            placeholder="••••••••"
            defaultValue={state?.formValues?.confirmPassword ?? ''}
          />

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3.5 rounded-xl text-sm font-extrabold transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPending
                ? 'bg-neutral-600 text-neutral-400'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {isPending ? 'Creando cuenta...' : 'Crear Restaurante y Cuenta'}
          </button>
        </form>

        {state?.success && (
          <div className="mt-4 p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-center">
            <div className="text-emerald-400 text-2xl mb-2">✅</div>
            <h3 className="text-emerald-300 font-bold mb-2">¡Cuenta creada con éxito!</h3>
            <p className="text-emerald-200 text-sm mb-3">
              Tu restaurante y tu cuenta de administrador fueron creados correctamente.
            </p>
            {state?.emailWarnings && (
              <div className="mb-3 p-3 bg-amber-950/50 border border-amber-800/80 rounded-xl text-amber-300 text-xs text-center">
                {state.emailWarnings.map((w, i) => (
                  <div key={i}>⚠️ {w}</div>
                ))}
              </div>
            )}
            <p className="text-emerald-200 text-sm mb-3">
              Te enviamos un correo de verificación a tu bandeja de entrada. Revisá también la carpeta de spam.
            </p>
            <Link
              href="/login"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2.5 rounded-lg transition block"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-neutral-200 transition underline"
          >
            ← Volver al menú principal
          </Link>
        </div>
      </div>
    </div>
  )
}