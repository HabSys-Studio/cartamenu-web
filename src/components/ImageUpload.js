'use client'

import { useState } from 'react'
import { uploadImageAction } from '@/app/admin/actions/uploadImage'

export default function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Llamada a la Server Action segura del servidor configurada con tus credenciales reales
      const result = await uploadImageAction(formData)

      if (result.success && result.url) {
        onChange(result.url)
      } else {
        throw new Error(result.error || 'Error al procesar la imagen en el servidor.')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrorMsg(error.message || 'No se pudo subir la imagen a Cloudinary. Verificá tus credenciales.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg">
          {errorMsg}
        </p>
      )}

      {/* Visualizador de la imagen actual */}
      {value ? (
        <div className="relative w-full h-44 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden group">
          <img
            src={value}
            alt="Vista previa del producto"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <label className="cursor-pointer bg-neutral-900 hover:bg-neutral-800 text-neutral-100 text-xs font-bold px-3.5 py-2 rounded-xl border border-neutral-700 shadow-lg transition">
              Cambiar foto
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        /* Opciones de Carga Inmediata: 1. Cámara | 2. Dispositivo */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Opción 1: Usar Cámara (Ideal Móviles) */}
          <label className="cursor-pointer flex flex-col items-center justify-center p-4 bg-neutral-950 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl transition group text-center">
            <span className="text-xl mb-1 group-hover:scale-110 transition">📷</span>
            <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400">
              {uploading ? 'Subiendo...' : 'Usar mi Cámara'}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">
              Toma una foto al toque (Móvil)
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Opción 2: Buscar en Dispositivo (PC / Galería) */}
          <label className="cursor-pointer flex flex-col items-center justify-center p-4 bg-neutral-950 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl transition group text-center">
            <span className="text-xl mb-1 group-hover:scale-110 transition">📁</span>
            <span className="text-xs font-bold text-neutral-200 group-hover:text-amber-400">
              {uploading ? 'Subiendo...' : 'Buscar en mi Dispositivo'}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5">
              Selecciona un archivo guardado
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

        </div>
      )}
    </div>
  )
}