import crypto from 'crypto'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUserRestaurants } from '@/lib/restaurant'
import { listAllRestaurants } from '@/app/admin/create-restaurant/actions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function slugifyBase(text) {
  const normalized = String(text || 'menu')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'menu'
}

async function ensureDefaultRestaurantForUser(user) {
  const existing = await getUserRestaurants(user.id)
  if (existing.length > 0) {
    return existing
  }

  const restaurantName = user.name ? `Carta de ${user.name}` : 'Mi Restaurante'
  const baseSlug = slugifyBase(user.name || user.email?.split('@')[0] || 'menu')
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`

  await prisma.$transaction(async (tx) => {
    const createdRestaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        ownerId: user.id,
      },
    })

    await tx.userRestaurant.create({
      data: {
        userId: user.id,
        restaurantId: createdRestaurant.id,
        role: 'OWNER',
      },
    })
  })

  return await getUserRestaurants(user.id)
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const user = session?.user
  const userId = user?.id
  const userRole = user?.role

  if (!userId) {
    redirect('/login')
  }

  if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
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
                Gestioná todos los restaurantes de Carta Menú
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
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Slug / URL
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Propietario
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Productos
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Categorías
                    </th>
                    <th className="px-4 py-3 text-xs font-bold text-neutral-400 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allRestaurants.map((r) => (
                    <tr key={r.id} className="border-b border-neutral-800/50">
                      <td className="px-4 py-3 text-neutral-100 font-medium">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">
                        /{r.slug}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">
                        {r.owner?.email || 'Sin asignar'}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">
                        {r._count?.products || 0}
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-sm">
                        {r._count?.categories || 0}
                      </td>
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

  const userRestaurants = await ensureDefaultRestaurantForUser(user)

  if (userRestaurants.length === 1) {
    redirect(`/admin/manage/${userRestaurants[0].id}`)
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
          Seleccionar Restaurante
        </h1>
        <p className="text-neutral-400 mb-6">
          Elegí qué restaurante deseás administrar:
        </p>

        <div className="space-y-3 mb-8">
          {userRestaurants.map((r) => (
            <Link
              key={r.id}
              href={`/admin/manage/${r.id}`}
              className="block w-full py-3 px-4 rounded-xl text-sm font-bold transition border bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-500"
            >
              {r.name} {r.role === 'OWNER' && '👑'}
              <span className="text-xs text-neutral-800 ml-2">
                {r.productCount} productos • {r.categoryCount} categorías
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="text-xs text-neutral-500 hover:text-neutral-300 underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}