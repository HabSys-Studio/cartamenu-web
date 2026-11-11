'use client'

import { useState } from 'react'
import { updateStoreSettings } from '@/app/admin/actions/settingsActions'

export default function ThemeCustomizer({ initialSettings }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const [settings, setSettings] = useState({
    bgColor: initialSettings?.bgColor || '#0a0a0a',
    menuTitleColor: initialSettings?.menuTitleColor || '#f59e0b',
    searchBgColor: initialSettings?.searchBgColor || '#171717',
    searchBtnColor: initialSettings?.searchBtnColor || '#262626',
    searchBtnTextColor: initialSettings?.searchBtnTextColor || '#ededed',
    cardBgColor: initialSettings?.cardBgColor || '#171717',
    cardTitleColor: initialSettings?.cardTitleColor || '#ededed',
    cardDescColor: initialSettings?.cardDescColor || '#a3a3a3',
    cardPriceColor: initialSettings?.cardPriceColor || '#f59e0b',
    cardBtnColor: initialSettings?.cardBtnColor || '#f59e0b',
    cardBtnTextColor: initialSettings?.cardBtnTextColor || '#0a0a0a',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData()
    Object.entries(settings).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const res = await updateStoreSettings(formData)
    setLoading(false)

    if (res.success) {
      setMessage({ type: 'success', text: '¡Configuración de colores actualizada correctamente!' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al guardar.' })
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl mb-8 overflow-hidden shadow-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-neutral-900 hover:bg-neutral-800/60 transition text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🎨</span>
          <div>
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              Personalización de Estilos y Colores de la Marca
            </h2>
            <p className="text-xs text-neutral-400">
              Modificá los colores de la carta pública en tiempo real.
            </p>
          </div>
        </div>
        <span className="text-neutral-400 font-bold text-lg transition-transform duration-300">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-6 border-t border-neutral-800 space-y-8 bg-neutral-950/40">
          {message && (
            <div
              className={`p-3 rounded-lg text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 1. Color General */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
              Color General
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Color de Fondo General</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="bgColor"
                    value={settings.bgColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="bgColor"
                    value={settings.bgColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Color de Carta Menú y Categorías</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="menuTitleColor"
                    value={settings.menuTitleColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="menuTitleColor"
                    value={settings.menuTitleColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Menú de Búsqueda y Filtros */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
              Menú de Búsqueda y Filtros
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Color Fondo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="searchBgColor"
                    value={settings.searchBgColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="searchBgColor"
                    value={settings.searchBgColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Color Botones</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="searchBtnColor"
                    value={settings.searchBtnColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="searchBtnColor"
                    value={settings.searchBtnColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Color Letras de Botones</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="searchBtnTextColor"
                    value={settings.searchBtnTextColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="searchBtnTextColor"
                    value={settings.searchBtnTextColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Tarjetas de Productos */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
              Tarjetas de Productos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Fondo de Tarjeta</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardBgColor"
                    value={settings.cardBgColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardBgColor"
                    value={settings.cardBgColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Titulo de Producto</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardTitleColor"
                    value={settings.cardTitleColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardTitleColor"
                    value={settings.cardTitleColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Descripcion de Producto</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardDescColor"
                    value={settings.cardDescColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardDescColor"
                    value={settings.cardDescColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Precio</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardPriceColor"
                    value={settings.cardPriceColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardPriceColor"
                    value={settings.cardPriceColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Botón + Agregar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardBtnColor"
                    value={settings.cardBtnColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardBtnColor"
                    value={settings.cardBtnColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Texto Botón + Agregar</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="cardBtnTextColor"
                    value={settings.cardBtnTextColor}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
                  />
                  <input
                    type="text"
                    name="cardBtnTextColor"
                    value={settings.cardBtnTextColor}
                    onChange={handleChange}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-800">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando cambios...' : 'Guardar Cambios de Estilo'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}