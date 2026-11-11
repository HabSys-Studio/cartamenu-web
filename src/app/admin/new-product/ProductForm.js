'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import { saveProduct } from '../actions'

export default function ProductForm({ categories, initialData = null }) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formData = new FormData(event.currentTarget)
    
    if (initialData?.id) {
      formData.append('id', initialData.id)
    }

    if (imageUrl) {
      formData.set('imageUrl', imageUrl)
    }

    const result = await saveProduct(formData)

    if (result?.success) {
      router.push('/admin')
      router.refresh()
    } else {
      setErrorMsg(result?.error || 'Ocurrió un error inesperado al guardar el producto.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Nombre y Prioridad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialData?.name || ''}
            placeholder="Ej: Hamburguesa Doble con Queso"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2" title="Menor número = Aparece más arriba en la categoría">
            Prioridad / Orden
          </label>
          <input
            type="number"
            name="order"
            defaultValue={initialData?.order ?? 0}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Selector de Categoría y Precio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Categoría *
          </label>
          <select
            name="categoryId"
            required
            defaultValue={initialData?.categoryId || ''}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:outline-none focus:border-amber-500 transition"
          >
            <option value="" disabled>
              Selecciona una categoría...
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Precio ($) *
          </label>
          <input
            type="text"
            name="price"
            required
            defaultValue={initialData?.price || ''}
            placeholder="0.00"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
          Descripción
        </label>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialData?.description || ''}
          placeholder="Ingredientes, tamaño o detalles adicionales del plato..."
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition resize-none"
        />
      </div>

      {/* Carga de Imagen */}
      <div>
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
          Imagen del Producto
        </label>
        <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url)} />
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-bold text-neutral-400 hover:text-neutral-200 px-4 py-2.5 rounded-xl transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="text-xs font-black bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 px-6 py-3 rounded-xl transition shadow-lg"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  )
}