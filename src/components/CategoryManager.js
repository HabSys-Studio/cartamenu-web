'use client'

import { useState } from 'react'
import { createCategory, updateCategory, deleteCategory } from '@/app/admin/actions'

export default function CategoryManager({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState(0)

  // Iniciar edición
  function handleStartEdit(cat) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditOrder(cat.order || 0)
    setErrorMsg('')
  }

  // Cancelar edición
  function handleCancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditOrder(0)
  }

  // Guardar cambios de edición
  async function handleSaveEdit(id) {
    setLoadingId(id)
    setErrorMsg('')
    
    const res = await updateCategory(id, editName, editOrder)
    if (!res.success) {
      setErrorMsg(res.error || 'No se pudo actualizar la categoría.')
    } else {
      setEditingId(null)
    }
    setLoadingId(null)
  }

  // Eliminar categoría
  async function handleDelete(id, name) {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return

    setLoadingId(id)
    setErrorMsg('')

    const res = await deleteCategory(id)
    if (!res.success) {
      setErrorMsg(res.error)
    }
    setLoadingId(null)
  }

  // Crear categoría
  async function handleCreate(e) {
    e.preventDefault()
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    setLoadingId('create')
    const res = await createCategory(formData)
    if (res.success) {
      e.target.reset()
    } else {
      setErrorMsg(res.error || 'Error al crear la categoría.')
    }
    setLoadingId(null)
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition"
      >
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Gestión de Categorías</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configura el orden de aparición, edita nombres o elimina categorías.
          </p>
        </div>
        <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
          {isOpen ? 'Ocultar ▲' : 'Administrar Categorías ▼'}
        </span>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-neutral-800 space-y-6 bg-neutral-950/50">
          
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs p-3 rounded-xl font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Formulario para Crear Categoría */}
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end bg-neutral-900 p-4 rounded-xl border border-neutral-800">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1">
                Nueva Categoría
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ej: Bebidas, Hamburguesas, Postres"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div className="w-full sm:w-28">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1" title="Menor número indica mayor prioridad arriba en el menú">
                Prioridad
              </label>
              <input
                type="number"
                name="order"
                defaultValue={0}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loadingId === 'create'}
              className="w-full sm:w-auto text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl transition disabled:opacity-50 whitespace-nowrap"
            >
              {loadingId === 'create' ? 'Guardando...' : '＋ Agregar'}
            </button>
          </form>

          {/* Listado y Edición de Categorías Vigentes */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">
              Categorías Vigentes ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4 text-center">
                No hay categorías registradas.
              </p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id
                  const isLoading = loadingId === cat.id

                  return (
                    <div
                      key={cat.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl"
                    >
                      {isEditing ? (
                        /* Modo Edición */
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="sm:col-span-2 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400">Prioridad:</span>
                            <input
                              type="number"
                              value={editOrder}
                              onChange={(e) => setEditOrder(e.target.value)}
                              className="w-20 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Modo Lectura */
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[10px] font-mono font-bold bg-neutral-950 text-neutral-400 px-2.5 py-1 rounded-lg border border-neutral-800"
                            title="Orden de prioridad"
                          >
                            Prioridad: {cat.order ?? 0}
                          </span>
                          <span className="text-xs font-bold text-neutral-200">
                            {cat.name}
                          </span>
                        </div>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 justify-end">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              disabled={isLoading}
                              className="text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3 py-1.5 rounded-lg transition"
                            >
                              {isLoading ? '...' : 'Guardar'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-[11px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg transition"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(cat)}
                              className="text-[11px] font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg transition"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              disabled={isLoading}
                              className="text-[11px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              {isLoading ? '...' : '🗑️ Eliminar'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}