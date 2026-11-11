'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleProductAvailability, deleteProduct } from '@/app/admin/actions'

export default function AdminProductRow({ product }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleProductAvailability(product.id, product.available)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`¿Estás seguro de eliminar permanentemente "${product.name}"?`)) return
    setLoading(true)
    await deleteProduct(product.id)
    setLoading(false)
  }

  return (
    <tr className="border-b border-neutral-800/60 hover:bg-neutral-900/40 transition text-xs">
      
      {/* Producto con Imagen y Nombre */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex-shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                Sin foto
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-neutral-200">{product.name}</p>
            <p className="text-[11px] text-neutral-500 line-clamp-1">
              {product.description || 'Sin descripción'}
            </p>
          </div>
        </div>
      </td>

      {/* Categoría */}
      <td className="py-3.5 px-4 text-neutral-400 font-medium">
        {product.category?.name || 'Sin categoría'}
      </td>

      {/* Prioridad / Orden */}
      <td className="py-3.5 px-4 font-mono font-bold text-amber-500/90">
        #{product.order ?? 0}
      </td>

      {/* Precio */}
      <td className="py-3.5 px-4 font-mono font-bold text-neutral-200">
        ${product.price.toFixed(2)}
      </td>

      {/* Estado Disponible / Agotado */}
      <td className="py-3.5 px-4">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
            product.available
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
          }`}
        >
          {loading ? '...' : product.available ? '🟢 Disponible' : '🔴 Agotado'}
        </button>
      </td>

      {/* Acciones (Editar y Eliminar) */}
      <td className="py-3.5 px-4 text-right space-x-2">
        <Link
          href={`/admin/edit-product/${product.id}`}
          className="inline-flex items-center bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg font-bold transition text-[11px]"
        >
          ✏️ Editar
        </Link>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg font-bold transition text-[11px] disabled:opacity-50"
        >
          {loading ? '...' : '🗑️'}
        </button>
      </td>

    </tr>
  )
}