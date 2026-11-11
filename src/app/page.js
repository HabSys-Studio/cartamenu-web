import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ProductCatalog from '@/components/ProductCatalog'
import CartDrawer from '@/components/CartDrawer'
import AutoRefresh from '@/components/AutoRefresh' // Importamos el sincronizador
import { getCurrentRestaurant } from '@/lib/restaurant'

export const revalidate = 60

export default async function HomePage() {
  const restaurant = await getCurrentRestaurant()

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
    include: {
      products: {
        where: { restaurantId: restaurant.id },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' }
        ],
      },
    },
  })

  const settings = restaurant

  // Definimos los estilos dinámicos de fondo general
  const customStyles = {
    backgroundColor: settings?.bgColor || '#0a0a0a',
  }

  return (
    <div 
      className="min-h-screen pb-20 transition-colors duration-300"
      style={customStyles}
    >
      {/* Componente que actualiza los datos en segundo plano */}
      <AutoRefresh />

      <header 
        className="border-b sticky top-0 z-40 backdrop-blur-md" 
        style={{ 
          backgroundColor: `${settings?.bgColor || '#0a0a0a'}ee`, 
          borderColor: settings?.searchBgColor || '#171717' 
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 
              className="text-2xl font-black tracking-tight"
              style={{ color: settings?.menuTitleColor || '#f59e0b' }}
            >
              Carta Menú
            </h1>
            <p className="text-xs text-neutral-400">
              Sabores auténticos hechos al instante
            </p>
          </div>

          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition border"
            style={{ 
              color: settings?.searchBtnTextColor || '#ededed', 
              borderColor: settings?.searchBgColor || '#262626',
              backgroundColor: settings?.searchBtnColor || '#171717'
            }}
          >
            Acceso Admin ↗
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        <ProductCatalog categories={categories} settings={settings} />
      </main>

      <CartDrawer settings={settings} />
    </div>
  )
}