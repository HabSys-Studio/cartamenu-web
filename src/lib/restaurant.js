import { prisma } from '@/lib/prisma'

export const DEFAULT_RESTAURANT_SLUG = 'carta-menu'

const defaultTheme = {
  bgColor: '#0a0a0a',
  menuTitleColor: '#f59e0b',
  searchBgColor: '#171717',
  searchBtnColor: '#262626',
  searchBtnTextColor: '#ededed',
  cardBgColor: '#171717',
  cardTitleColor: '#ededed',
  cardDescColor: '#a3a3a3',
  cardPriceColor: '#f59e0b',
  cardBtnColor: '#f59e0b',
  cardBtnTextColor: '#0a0a0a',
}

export async function getCurrentRestaurant(restaurantId) {
  // Si se pasa un restaurantId (desde la sesión de auth), usarlo directamente
  if (restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    })
    if (restaurant) {
      return restaurant
    }
  }

  // Fallback: restaurante por defecto o el primero (solo para uso sin sesión)
  const existing = await prisma.restaurant.findUnique({
    where: { slug: DEFAULT_RESTAURANT_SLUG },
  })

  if (existing) {
    return existing
  }

  const first = await prisma.restaurant.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (first) {
    return first
  }

  return prisma.restaurant.create({
    data: {
      name: 'Carta Menú',
      slug: DEFAULT_RESTAURANT_SLUG,
      ...defaultTheme,
    },
  })
}

export async function getRestaurantById(id) {
  return prisma.restaurant.findUnique({
    where: { id },
  })
}

export async function getRestaurantBySlug(slug) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  })

  if (!restaurant) {
    return null
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      products: {
        where: { restaurantId: restaurant.id },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      },
    },
    orderBy: { order: 'asc' },
  })

  return {
    ...restaurant,
    categories,
  }
}

export async function getOwnedCategory(restaurantId, categoryId) {
  if (!categoryId) return null

  return prisma.category.findFirst({
    where: { id: categoryId, restaurantId },
  })
}

export async function getOwnedProduct(restaurantId, productId) {
  if (!productId) return null

  return prisma.product.findFirst({
    where: { id: productId, restaurantId },
  })
}
