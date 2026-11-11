import Link from 'next/link'
import { registerRestaurant } from './actions'

export default function RegisterPage() {
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

        <form action={registerRestaurant} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Nombre del Restaurante
            </label>
            <input
              name="name"
              type="text"
              required
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
              placeholder="admin@tu-restaurante.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition mt-2"
          >
            Crear Restaurante y Cuenta
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/admin/login"
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}