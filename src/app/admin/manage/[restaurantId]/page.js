import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUserRestaurantAccess, getUserRestaurants } from '@/lib/restaurant'
import ThemeCustomizer from '@/components/ThemeCustomizer'
import CategoryManager from '@/components/CategoryManager'
import AdminProductList from '@/components/AdminProductList'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ManageRestaurantPage({ params }) {
  const session = await auth()
  const userId = session?.user?.id
  const resolvedParams = await params
  const restaurantId = resolvedParams?.restaurantId

  if (!userId) {
    redirect('/login')
  }

  if (!restaurantId) {
    redirect('/admin')
  }

  const restaurant = await getUserRestaurantAccess(userId, restaurantId)

  if (!restaurant) {
    redirect('/admin')
  }

  const [userRestaurants, categories, products] = await Promise.all([
    getUserRestaurants(userId),
    prisma.category.findMany({
      where: { restaurantId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.product.findMany({
      where: { restaurantId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
  ])

  const totalProducts = products.length
  const activeCategories = categories.length

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <Link
              href="/admin"
              className="text-xs text-neutral-400 hover:text-neutral-200 inline-block mb-2"
            >
              ← Volver al panel
            </Link>
            <h1 className="text-3xl font-black text-amber-500 tracking-tight">
              Panel de Control - {restaurant.name}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Administra los precios, disponibilidad, categorías y menú en tiempo real.
            </p>
          </div>

          {userRestaurants.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              {userRestaurants.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/manage/${r.id}`}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${
                    r.id === restaurantId
                      ? 'bg-amber-500 text-neutral-950 border-amber-500'
                      : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:border-amber-500'
                  }`}
                >
                  {r.name} {r.role === 'OWNER' && '👑'}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/new-product?restaurantId=${restaurant.id}`}
              className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1"
            >
              ＋ Nuevo Producto
            </Link>
            <Link
              href={`/${restaurant.slug}`}
              target="_blank"
              className="text-xs font-bold text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-4 py-2.5 rounded-xl transition"
            >
              Ver Carta Pública ↗
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Total de Productos</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{totalProducts}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Categorías Activas</p>
            <p className="text-2xl font-black text-neutral-100 mt-1">{activeCategories}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Estado del Local</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">Activo</p>
          </div>
        </div>

        {/* 1. Personalización de colores agrupada por sector (arriba de categorías) */}
        <ThemeCustomizer
          initialSettings={restaurant}
          restaurantId={restaurant.id}
        />

        {/* 2. Gestión de categorías con prioridad de orden */}
        <CategoryManager
          categories={categories}
          restaurantId={restaurant.id}
        />

        {/* 3. Gestión de productos en tabla con buscador y switch En Stock / Agotado */}
        <AdminProductList
          products={products}
          categories={categories}
        />
      </div>
    </div>
  )
}