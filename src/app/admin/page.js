import { prisma } from '@/lib/prisma'
import CategoryManager from '@/components/CategoryManager'
import AdminProductList from '@/components/AdminProductList'
import ThemeCustomizer from '@/components/ThemeCustomizer' // Importamos nuestro componente de estilos
import { getCurrentRestaurant } from '@/lib/restaurant'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const restaurant = await getCurrentRestaurant()

  const products = await prisma.product.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
  })

  const settings = restaurant

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-amber-500 tracking-tight">
              Panel de Control - Carta Menú
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Administra los precios, disponibilidad, categorías y menú del comercio en tiempo real.
            </p>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/new-product"
              className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1"
            >
              ＋ Nuevo Producto
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2.5 rounded-xl transition"
            >
              Ver Carta Pública ↗
            </Link>
          </div>
        </div>

        {/* Panel Desplegable de Personalización de Estilos */}
        <ThemeCustomizer initialSettings={settings} />

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Total de Productos</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{products.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Categorías Activas</p>
            <p className="text-2xl font-black text-neutral-100 mt-1">{categories.length}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Productos Agotados</p>
            <p className="text-2xl font-black text-rose-500 mt-1">
              {products.filter((p) => !p.available).length}
            </p>
          </div>
        </div>

        {/* Módulo Interactivo de Gestión de Categorías */}
        <CategoryManager categories={categories} />

        {/* Módulo Interactivo de Gestión de Productos con Buscador, Filtro y Ordenamiento */}
        <AdminProductList products={products} categories={categories} />

      </div>
    </div>
  )
}