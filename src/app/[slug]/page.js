import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCatalog from '@/components/ProductCatalog'
import CartDrawer from '@/components/CartDrawer'
import AutoRefresh from '@/components/AutoRefresh'
import { getRestaurantBySlug } from '@/lib/restaurant'

export const revalidate = 60

export default async function RestaurantMenuPage({ params }) {
  const { slug } = params

  const restaurant = await getRestaurantBySlug(slug)

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-300">Restaurante no encontrado</h1>
          <p className="text-neutral-500 mt-2">El menú que buscas no existe.</p>
          <Link
            href="/"
            className="text-amber-500 hover:text-amber-400 font-semibold mt-4 inline-block"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  const categories = restaurant.categories

  const customStyles = {
    backgroundColor: restaurant.bgColor || '#0a0a0a',
  }

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300" style={customStyles}>
      <AutoRefresh />

      <header
        className="border-b sticky top-0 z-40 backdrop-blur-md"
        style={{
          backgroundColor: `${restaurant.bgColor || '#0a0a0a'}ee`,
          borderColor: restaurant.searchBgColor || '#171717',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: restaurant.menuTitleColor || '#f59e0b' }}>
              {restaurant.name}
            </h1>
            <p className="text-xs text-neutral-400">
              Menú digital de {restaurant.name}
            </p>
          </div>

          <Link
            href="/admin/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition border"
            style={{
              color: restaurant.searchBtnTextColor || '#ededed',
              borderColor: restaurant.searchBgColor || '#262626',
              backgroundColor: restaurant.searchBtnColor || '#171717',
            }}
          >
            Acceso Admin ↗
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        <ProductCatalog categories={categories} settings={restaurant} />
      </main>

      <CartDrawer settings={restaurant} />
    </div>
  )
}