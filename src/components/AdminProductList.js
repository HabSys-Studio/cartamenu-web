'use client'

import { useState, useMemo } from 'react'
import AdminProductRow from './AdminProductRow'

export default function AdminProductList({ products = [], categories = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  
  // Estado para múltiples reglas de ordenamiento: [{ field: 'category', direction: 'asc' }, ...]
  const [sortRules, setSortRules] = useState([])

  // Función para manejar el clic en las cabeceras de la tabla (Soporte Multinivel)
  const handleSort = (field) => {
    setSortRules((prevRules) => {
      const existingIndex = prevRules.findIndex((rule) => rule.field === field)

      if (existingIndex !== -1) {
        const currentRule = prevRules[existingIndex]
        if (currentRule.direction === 'asc') {
          // Cambiar a descendente
          const updated = [...prevRules]
          updated[existingIndex] = { field, direction: 'desc' }
          return updated
        } else {
          // Remover regla si ya estaba en 'desc'
          return prevRules.filter((rule) => rule.field !== field)
        }
      } else {
        // Agregar nueva regla al final de la jerarquía de orden
        return [...prevRules, { field, direction: 'asc' }]
      }
    })
  }

  // Limpiar todas las reglas de ordenamiento
  const clearSorts = () => setSortRules([])

  // Filtrado y Ordenamiento Multinivel reactivo en tiempo real
  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filtrar por búsqueda y categoría
    const result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        selectedCategory === 'ALL' || product.categoryId === selectedCategory

      return matchesSearch && matchesCategory
    })

    // 2. Aplicar Ordenamiento Multinivel si existen reglas
    if (sortRules.length > 0) {
      result.sort((a, b) => {
        for (const rule of sortRules) {
          let valA, valB

          switch (rule.field) {
            case 'name':
              valA = a.name.toLowerCase()
              valB = b.name.toLowerCase()
              break
            case 'category':
              valA = (a.category?.name || '').toLowerCase()
              valB = (b.category?.name || '').toLowerCase()
              break
            case 'order':
              valA = a.order ?? 0
              valB = b.order ?? 0
              break
            case 'price':
              valA = Number(a.price) || 0
              valB = Number(b.price) || 0
              break
            case 'available':
              valA = a.available ? 1 : 0
              valB = b.available ? 1 : 0
              break
            default:
              continue
          }

          if (valA < valB) return rule.direction === 'asc' ? -1 : 1
          if (valA > valB) return rule.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [products, searchQuery, selectedCategory, sortRules])

  // Obtener el indicador visual y la prioridad numérica de una columna en las reglas activas
  const getSortMeta = (field) => {
    const index = sortRules.findIndex((rule) => rule.field === field)
    if (index === -1) {
      return { active: false, index: -1, direction: null }
    }
    return {
      active: true,
      index: index + 1,
      direction: sortRules[index].direction,
    }
  }

  // Nombres legibles para los badges de orden activo
  const fieldLabels = {
    name: 'Producto',
    category: 'Categoría',
    order: 'Prioridad',
    price: 'Precio',
    available: 'Estado',
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      
      {/* Cabecera del Módulo y Controles de Búsqueda/Filtro */}
      <div className="p-5 border-b border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-100">
              Gestión de Productos
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Haz clic en las columnas para aplicar ordenamiento múltiple encadenado.
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-400">
            Mostrando {filteredAndSortedProducts.length} de {products.length} productos
          </span>
        </div>

        {/* Panel de Indicadores de Ordenamiento Activo (Multinivel) */}
        {sortRules.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-xs">
            <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Orden activo:</span>
            {sortRules.map((rule, idx) => (
              <span
                key={rule.field}
                className="bg-neutral-900 border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
              >
                <span className="bg-amber-500 text-neutral-950 font-black px-1.5 py-0.2 rounded text-[10px]">
                  {idx + 1}
                </span>
                {fieldLabels[rule.field]}
                <span className="font-bold">{rule.direction === 'asc' ? '▲' : '▼'}</span>
              </span>
            ))}
            <button
              onClick={clearSorts}
              className="ml-auto text-neutral-400 hover:text-rose-400 font-bold text-[11px] transition"
            >
              Limpiar orden ✕
            </button>
          </div>
        )}

        {/* Barra de Búsqueda y Selector de Categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Buscador de Texto */}
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-neutral-500 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto por nombre o ingrediente..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro por Categoría */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">Todas las categorías ({products.length})</option>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({count})
                  </option>
                )
              })}
            </select>
          </div>

        </div>
      </div>

      {/* Tabla de Productos con Orden Multinivel */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-950 border-b border-neutral-800 text-[11px] font-extrabold uppercase text-neutral-400 tracking-wider">
              
              {/* Columna Producto */}
              <th 
                onClick={() => handleSort('name')}
                className="py-3.5 px-4 cursor-pointer hover:text-amber-400 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  Producto
                  {(() => {
                    const meta = getSortMeta('name')
                    return meta.active ? (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                        <span>{meta.direction === 'asc' ? '▲' : '▼'}</span>
                        <span className="bg-neutral-800 text-neutral-300 px-1 rounded">{meta.index}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[10px]">↕</span>
                    )
                  })()}
                </div>
              </th>

              {/* Columna Categoría */}
              <th 
                onClick={() => handleSort('category')}
                className="py-3.5 px-4 cursor-pointer hover:text-amber-400 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  Categoría
                  {(() => {
                    const meta = getSortMeta('category')
                    return meta.active ? (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                        <span>{meta.direction === 'asc' ? '▲' : '▼'}</span>
                        <span className="bg-neutral-800 text-neutral-300 px-1 rounded">{meta.index}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[10px]">↕</span>
                    )
                  })()}
                </div>
              </th>

              {/* Columna Prioridad */}
              <th 
                onClick={() => handleSort('order')}
                className="py-3.5 px-4 cursor-pointer hover:text-amber-400 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  Prioridad
                  {(() => {
                    const meta = getSortMeta('order')
                    return meta.active ? (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                        <span>{meta.direction === 'asc' ? '▲' : '▼'}</span>
                        <span className="bg-neutral-800 text-neutral-300 px-1 rounded">{meta.index}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[10px]">↕</span>
                    )
                  })()}
                </div>
              </th>

              {/* Columna Precio */}
              <th 
                onClick={() => handleSort('price')}
                className="py-3.5 px-4 cursor-pointer hover:text-amber-400 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  Precio
                  {(() => {
                    const meta = getSortMeta('price')
                    return meta.active ? (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                        <span>{meta.direction === 'asc' ? '▲' : '▼'}</span>
                        <span className="bg-neutral-800 text-neutral-300 px-1 rounded">{meta.index}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[10px]">↕</span>
                    )
                  })()}
                </div>
              </th>

              {/* Columna Estado */}
              <th 
                onClick={() => handleSort('available')}
                className="py-3.5 px-4 cursor-pointer hover:text-amber-400 transition select-none"
              >
                <div className="flex items-center gap-1.5">
                  Estado
                  {(() => {
                    const meta = getSortMeta('available')
                    return meta.active ? (
                      <span className="text-amber-500 flex items-center gap-0.5 text-[10px]">
                        <span>{meta.direction === 'asc' ? '▲' : '▼'}</span>
                        <span className="bg-neutral-800 text-neutral-300 px-1 rounded">{meta.index}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[10px]">↕</span>
                    )
                  })()}
                </div>
              </th>

              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-neutral-500 italic">
                  {searchQuery || selectedCategory !== 'ALL'
                    ? 'No se encontraron productos que coincidan con la búsqueda o filtro aplicados.'
                    : 'No hay productos registrados en el sistema.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <AdminProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}