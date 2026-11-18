import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const restaurantId = session.user.restaurantId

  // Obtener el restaurante del usuario y su admin
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      admins: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      },
      _count: {
        select: {
          admins: true,
          products: true,
          categories: true,
        },
      },
    },
  })

  if (!restaurant) {
    return Response.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  // Obtener todos los restaurantes y sus admins (para visibilidad completa del ecosistema)
  const allRestaurants = await prisma.restaurant.findMany({
    include: {
      admins: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      },
      _count: {
        select: {
          admins: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Obtener todos los admins con su restaurante (para ver qué mail está ligado a qué local)
  const allAdmins = await prisma.adminUser.findMany({
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { email: 'asc' },
  })

  return Response.json({
    current: {
      restaurant,
    },
    allRestaurants,
    allAdmins,
  })
}