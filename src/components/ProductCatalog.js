'use client'

import { useState, useMemo } from 'react'
import ProductCard from './ProductCard'
import Toast from './Toast'

export default function ProductCatalog({ categories, settings }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hideOutStock, setHideOutStock] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const triggerToast = (productName) => {
    setToastMessage(`¡"${productName}" agregado al carrito! 🛒`)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // Filtrado optimizado en memoria
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return null
        }

        const filteredProducts = cat.products.filter((product) => {
          const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description &&
              product.description.toLowerCase().includes(searchQuery.toLowerCase()))

          const matchesStock = hideOutStock ? product.available : true

          return matchesSearch && matchesStock
        })

        return {
          ...cat,
          products: filteredProducts,
        }
      })
      .filter((cat) => cat !== null && cat.products.length > 0)
  }, [categories, searchQuery, selectedCategory, hideOutStock])

  // Colores dinámicos configurados
  const searchBg = settings?.searchBgColor || '#171717'
  const btnBg = settings?.searchBtnColor || '#262626'
  const btnText = settings?.searchBtnTextColor || '#ededed'
  const menuTitleColor = settings?.menuTitleColor || '#f59e0b'
  const activeTabBg = settings?.menuTitleColor || '#f59e0b'

  return (
    <div className="space-y-8">
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Panel de Buscador y Filtros */}
      <div 
        className="border rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 transition-colors"
        style={{ backgroundColor: searchBg, borderColor: btnBg }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Buscador por Texto */}
          <div className="md:col-span-7 relative">
            <input
              type="text"
              placeholder="🔍 Buscar plato, bebida o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border rounded-xl px-4 py-3 text-sm transition focus:outline-none"
              style={{ 
                color: btnText, 
                borderColor: btnBg,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs font-bold"
                style={{ color: menuTitleColor }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Toggle Ocultar Agotados */}
          <div className="md:col-span-5 flex items-center justify-start md:justify-end">
            <label 
              className="flex items-center gap-3 cursor-pointer select-none text-xs font-semibold px-4 py-3 rounded-xl border transition w-full md:w-auto justify-between md:justify-start"
              style={{ backgroundColor: btnBg, borderColor: btnBg, color: btnText }}
            >
              <span>Ocultar productos agotados</span>
              <input
                type="checkbox"
                checked={hideOutStock}
                onChange={(e) => setHideOutStock(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: menuTitleColor }}
              />
            </label>
          </div>

        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className="whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition border"
            style={{
              backgroundColor: selectedCategory === 'all' ? activeTabBg : btnBg,
              color: selectedCategory === 'all' ? '#0a0a0a' : btnText,
              borderColor: selectedCategory === 'all' ? activeTabBg : btnBg
            }}
          >
            Todas las categorías
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full transition border"
              style={{
                backgroundColor: selectedCategory === cat.id ? activeTabBg : btnBg,
                color: selectedCategory === cat.id ? '#0a0a0a' : btnText,
                borderColor: selectedCategory === cat.id ? activeTabBg : btnBg
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Renderizado de Categorías Filtradas */}
      {filteredCategories.length === 0 ? (
        <div 
          className="text-center py-16 rounded-2xl border"
          style={{ backgroundColor: searchBg, borderColor: btnBg }}
        >
          <p className="text-sm font-semibold" style={{ color: btnText }}>
            No se encontraron productos que coincidan con tu búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setHideOutStock(false)
            }}
            className="mt-3 text-xs font-bold hover:underline"
            style={{ color: menuTitleColor }}
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <section key={category.id} className="scroll-mt-28">
            <div className="flex items-center gap-4 mb-6">
              <h2 
                className="text-2xl font-extrabold"
                style={{ color: menuTitleColor }}
              >
                {category.name}
              </h2>
              <div 
                className="h-px flex-1" 
                style={{ backgroundColor: btnBg }} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  settings={settings}
                  onAddToCart={() => triggerToast(product.name)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}