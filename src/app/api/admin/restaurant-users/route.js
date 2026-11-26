import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireRestaurantAccess,
  handleApiAuthError,
} from '@/lib/restaurant-access'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedRestaurantId = searchParams.get('restaurantId')

    // Primero verificamos sesión; si no pasa restaurantId por query, tomamos activeRestaurantId del token
    const { auth } = await import('@/auth')
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const targetRestaurantId =
      requestedRestaurantId || session.user.activeRestaurantId

    if (!targetRestaurantId) {
      return NextResponse.json(
        { error: 'No hay un restaurante activo seleccionado.' },
        { status: 400 }
      )
    }

    const { restaurant, membershipRole } = await requireRestaurantAccess(
      targetRestaurantId,
      'STAFF'
    )

    const restaurantMembers = await prisma.userRestaurant.findMany({
      where: { restaurantId: restaurant.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const counts = await prisma.restaurant.findUnique({
      where: { id: restaurant.id },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        _count: {
          select: {
            users: true,
            products: true,
            categories: true,
            orders: true,
          },
        },
      },
    })

    // Si es SUPERADMIN o OWNER, puede ver el panorama general de restaurantes;
    // para ADMIN o STAFF devolvemos solo los miembros de su restaurante
    const isPrivileged =
      session.user.role === 'SUPERADMIN' || membershipRole === 'OWNER'

    let allRestaurants = []
    let allUsers = []

    if (isPrivileged) {
      allRestaurants = await prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              products: true,
              categories: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          role: true,
          restaurants: {
            select: {
              role: true,
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { email: 'asc' },
      })
    }

    return NextResponse.json({
      current: {
        restaurant: counts,
        membershipRole,
        members: restaurantMembers.map((m) => ({
          membershipId: m.id,
          role: m.role,
          createdAt: m.createdAt,
          user: m.user,
        })),
      },
      allRestaurants,
      allUsers,
    })
  } catch (error) {
    return handleApiAuthError(error)
  }
}