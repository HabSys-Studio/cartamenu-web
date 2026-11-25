import { prisma } from '@/lib/prisma'

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

/**
 * Obtiene todos los restaurantes de un usuario
 */
export async function getUserRestaurants(userId) {
  const userRestaurants = await prisma.userRestaurant.findMany({
    where: { userId },
    include: {
      restaurant: {
        include: {
          _count: {
            select: { products: true, categories: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return userRestaurants.map((ur) => ({
    id: ur.restaurant.id,
    name: ur.restaurant.name,
    slug: ur.restaurant.slug,
    role: ur.role,
    productCount: ur.restaurant._count.products,
    categoryCount: ur.restaurant._count.categories,
  }))
}

/**
 * Obtiene un restaurante por ID (para uso público)
 */
export async function getRestaurantById(id) {
  return prisma.restaurant.findUnique({
    where: { id },
  })
}

/**
 * Obtiene un restaurante por slug con sus categorías y productos
 */
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

/**
 * Verifica que un usuario tenga acceso a un restaurante
 */
export async function getUserRestaurantAccess(userId, restaurantId) {
  const userRestaurant = await prisma.userRestaurant.findFirst({
    where: { userId, restaurantId },
    include: {
      restaurant: true,
    },
  })

  if (!userRestaurant) {
    return null
  }

  return {
    id: userRestaurant.restaurant.id,
    name: userRestaurant.restaurant.name,
    slug: userRestaurant.restaurant.slug,
    role: userRestaurant.role,
    bgColor: userRestaurant.restaurant.bgColor,
    menuTitleColor: userRestaurant.restaurant.menuTitleColor,
    searchBgColor: userRestaurant.restaurant.searchBgColor,
    searchBtnColor: userRestaurant.restaurant.searchBtnColor,
    searchBtnTextColor: userRestaurant.restaurant.searchBtnTextColor,
    cardBgColor: userRestaurant.restaurant.cardBgColor,
    cardTitleColor: userRestaurant.restaurant.cardTitleColor,
    cardDescColor: userRestaurant.restaurant.cardDescColor,
    cardPriceColor: userRestaurant.restaurant.cardPriceColor,
    cardBtnColor: userRestaurant.restaurant.cardBtnColor,
    cardBtnTextColor: userRestaurant.restaurant.cardBtnTextColor,
  }
}

/**
 * Obtiene el restaurante activo desde la sesión (para admin)
 */
export async function getActiveRestaurant(userId, restaurantId) {
  if (!restaurantId) {
    // Si no se especifica, devolver el primero disponible
    const restaurants = await getUserRestaurants(userId)
    if (restaurants.length > 0) {
      return restaurants[0]
    }
    return null
  }

  return getUserRestaurantAccess(userId, restaurantId)
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

/**
 * Crear un nuevo restaurante y asociarlo al usuario
 */
export async function createRestaurantForUser(userId, data) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      restaurants: true,
    },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Verificar límite de restaurantes según plan
  if (user.restaurants.length >= user.maxRestaurants) {
    throw new Error(`Has alcanzado el límite de ${user.maxRestaurants} restaurante(s) para tu plan ${user.plan}.`)
  }

  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: userId,
        ...defaultTheme,
      },
    })

    await tx.userRestaurant.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        role: 'OWNER',
      },
    })

    return restaurant
  })
}

/**
 * Invitar a un usuario a un restaurante
 */
export async function addUserToRestaurant(userId, restaurantId, role = 'ADMIN') {
  return prisma.userRestaurant.create({
    data: {
      userId,
      restaurantId,
      role,
    },
  })
}
