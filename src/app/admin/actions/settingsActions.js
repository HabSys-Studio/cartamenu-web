'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getCurrentRestaurant } from '@/lib/restaurant'

async function getRestaurantFromSession() {
  const session = await auth()
  const restaurantId = session?.user?.restaurantId
  if (!restaurantId) {
    throw new Error('No hay sesión de administrador activa.')
  }
  const restaurant = await getCurrentRestaurant(restaurantId)
  if (!restaurant) {
    throw new Error('Restaurante no encontrado.')
  }
  return restaurant
}

const fallbackTheme = {
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

function readTheme(formData) {
  return {
    bgColor: formData.get('bgColor') || fallbackTheme.bgColor,
    menuTitleColor: formData.get('menuTitleColor') || fallbackTheme.menuTitleColor,
    searchBgColor: formData.get('searchBgColor') || fallbackTheme.searchBgColor,
    searchBtnColor: formData.get('searchBtnColor') || fallbackTheme.searchBtnColor,
    searchBtnTextColor: formData.get('searchBtnTextColor') || fallbackTheme.searchBtnTextColor,
    cardBgColor: formData.get('cardBgColor') || fallbackTheme.cardBgColor,
    cardTitleColor: formData.get('cardTitleColor') || fallbackTheme.cardTitleColor,
    cardDescColor: formData.get('cardDescColor') || fallbackTheme.cardDescColor,
    cardPriceColor: formData.get('cardPriceColor') || fallbackTheme.cardPriceColor,
    cardBtnColor: formData.get('cardBtnColor') || fallbackTheme.cardBtnColor,
    cardBtnTextColor: formData.get('cardBtnTextColor') || fallbackTheme.cardBtnTextColor,
  }
}

export async function getStoreSettings() {
  try {
    return await getRestaurantFromSession()
  } catch (error) {
    console.error('Error al obtener la configuración de la tienda:', error)
    return fallbackTheme
  }
}

export async function updateStoreSettings(formData) {
  try {
    const restaurant = await getRestaurantFromSession()

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: readTheme(formData),
    })

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error al actualizar la configuración:', error)
    return { success: false, error: 'No se pudo guardar la configuración de colores.' }
  }
}
