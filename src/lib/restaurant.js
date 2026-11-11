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

export async function getCurrentRestaurant() {
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
