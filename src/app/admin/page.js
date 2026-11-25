import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getUserRestaurants } from '@/lib/restaurant'
import { listAllRestaurants } from '@/app/admin/create-restaurant/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await auth()
  const user = session?.user
  const userId = user?.id
  const userRole = user?.role

  if (!userId) {
    redirect('/login')
  }

  // Si es administrador de plataforma, mostrar listado de todos los restaurantes
  if (userRole === 'ADMIN') {
    const allRestaurants = await listAllRestaurants()
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <h1 className="text-3xl font-black text-amber-500 tracking-tight mb-2">
                Administración de Plataforma
              </h1>
              <p className="text-xs text-neutral-400">
                Gestiona todos los restaurantes de Carta Menú
              </p>
            </div>
            <Link
              href="/admin/create-restaurant"
              className="text-xs font-black bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1"
            >
              ＋ Crear Restaurante
            </Link>
          </div>

          {allRestaurants.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
              <p className="text-neutral-400 text-sm">
                No hay restaurantes registrados aún.
              </p>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-800/50">
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Slug / URL</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Propietario</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Productos</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Categorías</th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {allRestaurants.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-800/50">
                      <td className="px-4 py-3 text-neutral-100 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">/{r.slug}</td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">{r.owner?.email || 'Sin asignar'}</td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">{r._count?.products || 0}</td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">{r._count?.categories || 0}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/manage/${r.id}`}
                          className="text-xs text-amber-400 hover:text-amber-300 underline"
                        >
                          Gestionar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Obtener los restaurantes del usuario (rol USER)
  const userRestaurants = await getUserRestaurants(userId)

  if (userRestaurants.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Sin restaurantes asignados
          </h1>
          <p className="text-neutral-400 mb-6">
            No tienes ningún restaurante asignado. Contacta al administrador de la plataforma.
          </p>
          <Link
            href="/login"
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-lg transition block"
          >
            Cerrar sesión
          </Link>
        </div>
      </div>
    )
  }

  // Si hay solo un restaurante, ir directo al panel de ese restaurante
  if (userRestaurants.length === 1) {
    const restaurant = userRestaurants[0]
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
        <RestaurantAdminPanel
          userId={userId}
          restaurant={restaurant}
          userRestaurants={userRestaurants}
        />
      </div>
    )
  }

  // Si hay varios restaurantes, mostrar selector
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
          Seleccionar Restaurante
        </h1>
        <p className="text-neutral-400 mb-6">
          Elige qué restaurante deseas administrar:
        </p>

        <div className="space-y-3 mb-8">
          {userRestaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                window.location.href = `/admin/manage/${r.id}`
              }}
              className="w-full py-3 rounded-xl text-sm font-bold transition border bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-500"
            >
              {r.name} {r.role === 'OWNER' && '👑'}
              <span className="text-xs text-neutral-500 ml-2">
                {r.productCount} productos • {r.categoryCount} categorías
              </span>
            </button>
          ))}
        </div>

        <Link
          href="/login"
          className="text-xs text-neutral-500 hover:text-neutral-300 underline"
        >
          Cerrar sesión
        </Link>
      </div>
    </div>
  )
}

function RestaurantAdminPanel({ userId, restaurant, userRestaurants }) {
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
                defaultValue={restaurant.id}
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
            <p className="text-2xl font-black text-amber-500 mt-1">{restaurant.productCount}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Categorías Activas</p>
            <p className="text-2xl font-black text-neutral-100 mt-1">{restaurant.categoryCount}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-400 font-semibold">Productos Agotados</p>
            <p className="text-2xl font-black text-rose-500 mt-1">-</p>
          </div>
        </div>

        {/* Contenido del panel */}
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