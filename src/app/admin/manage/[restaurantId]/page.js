import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserRestaurantAccess, getUserRestaurants } from '@/lib/restaurant'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ManageRestaurantPage({ params }) {
  const session = await auth()
  const userId = session?.user?.id
  const { restaurantId } = params

  if (!userId) {
    redirect('/login')
  }

  // Verificar acceso al restaurante
  const restaurant = await getUserRestaurantAccess(userId, restaurantId)

  if (!restaurant) {
    redirect('/admin')
  }

  // Obtener todos los restaurantes del usuario para el selector
  const userRestaurants = await getUserRestaurants(userId)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Encabezado Principal con selector de restaurante */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-amber-500 tracking-tight">
              Panel de Control - {restaurant.name}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Administra los precios, disponibilidad, categorías y menú en tiempo real.
            </p>
          </div>

          {/* Selector de restaurante (si hay varios) */}
          {userRestaurants.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Cambiar restaurante:</span>
              <select
                defaultValue={restaurantId}
                onChange={(e) => {
                  window.location.href = `/admin/manage/${e.target.value}`
                }}
                className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 outline-none"
              >
                {userRestaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.role === 'OWNER' && '👑'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/new-product"
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

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Total de Productos</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{restaurant.productCount || '-'}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Categorías Activas</p>
            <p className="text-2xl font-black text-neutral-100 mt-1">{restaurant.categoryCount || '-'}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Productos Agotados</p>
            <p className="text-2xl font-black text-rose-500 mt-1">-</p>
          </div>
        </div>

        {/* Contenido del panel - Placeholder */}
        <div className="space-y-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-neutral-100">Gestión de Categorías</h2>
            <p className="text-neutral-400 text-sm">
              Próximamente: gestión de categorías para {restaurant.name}
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-neutral-100">Gestión de Productos</h2>
            <p className="text-neutral-400 text-sm">
              Próximamente: gestión de productos para {restaurant.name}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}