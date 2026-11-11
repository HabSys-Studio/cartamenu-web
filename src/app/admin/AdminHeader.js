'use client'

import Link from 'next/link'
import { logoutAction } from '@/app/admin/actions/authActions'

export default function AdminHeader({ userEmail }) {
  return (
    <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50 backdrop-blur-md bg-neutral-900/90">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold text-amber-500">Panel Admin</h1>
            <p className="text-xs text-neutral-400">
              Sesión activa: <span className="text-neutral-200 font-medium">{userEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition border border-neutral-700 flex items-center gap-1.5"
          >
            <span>Ver Carta Pública</span>
            <span>↗</span>
          </Link>

          <Link
            href="/admin/new-product"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition"
          >
            + Nuevo Producto
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/80 transition"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}