'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  getUserRestaurantAccess,
  getOwnedCategory,
  getOwnedProduct,
} from '@/lib/restaurant'

async function getRestaurantFromSession(userId, restaurantId) {
  if (!restaurantId) {
    throw new Error('No se ha especificado un restaurante.')
  }
  const restaurant = await getUserRestaurantAccess(userId, restaurantId)
  if (!restaurant) {
    throw new Error('No tienes acceso a este restaurante.')
  }
  return restaurant
}

function revalidateRestaurantPaths(restaurant) {
  revalidatePath('/')
  revalidatePath('/admin')
  if (restaurant?.id) {
    revalidatePath(`/admin/manage/${restaurant.id}`)
  }
  if (restaurant?.slug) {
    revalidatePath(`/${restaurant.slug}`)
  }
}

// --- GESTIÓN DE PRODUCTOS ---

export async function saveProduct(formData, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)

    const id = String(formData.get('id') || '').trim()
    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const price = parseFloat(formData.get('price'))
    const categoryId = String(formData.get('categoryId') || '').trim()
    const imageUrl = String(formData.get('imageUrl') || '').trim()
    const orderInput = formData.get('order')
    const parsedOrder = orderInput ? parseInt(orderInput, 10) : 0
    const order = Number.isNaN(parsedOrder) ? 0 : parsedOrder

    if (!name || Number.isNaN(price) || price < 0 || !categoryId) {
      return {
        success: false,
        error: 'Por favor completá los campos obligatorios con valores válidos.',
      }
    }

    const category = await getOwnedCategory(restaurantId, categoryId)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    if (id) {
      const product = await getOwnedProduct(restaurantId, id)
      if (!product) {
        return { success: false, error: 'El producto no pertenece a este local.' }
      }

      await prisma.product.update({
        where: { id },
        data: { name, description, price, categoryId, imageUrl, order },
      })
    } else {
      await prisma.product.create({
        data: {
          name,
          description,
          price,
          categoryId,
          imageUrl,
          available: true,
          order,
          restaurantId,
        },
      })
    }

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error saving product:', error)
    return {
      success: false,
      error: 'Error al guardar el producto en la base de datos.',
    }
  }
}

export async function toggleProductAvailability(id, currentStatus, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)
    const product = await getOwnedProduct(restaurantId, id)

    if (!product) {
      return { success: false }
    }

    await prisma.product.update({
      where: { id },
      data: { available: !product.available },
    })

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error toggling availability:', error)
    return { success: false }
  }
}

export async function deleteProduct(id, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)
    const product = await getOwnedProduct(restaurantId, id)

    if (!product) {
      return { success: false }
    }

    await prisma.product.delete({
      where: { id },
    })

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false }
  }
}

// --- GESTIÓN DE CATEGORÍAS ---

export async function createCategory(formData, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)

    const name = String(formData.get('name') || '').trim()
    const orderInput = formData.get('order')
    const parsedOrder = orderInput ? parseInt(orderInput, 10) : 0
    const order = Number.isNaN(parsedOrder) ? 0 : parsedOrder

    if (!name) {
      return { success: false, error: 'El nombre de la categoría es requerido.' }
    }

    await prisma.category.create({
      data: { name, order, restaurantId },
    })

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'No se pudo crear la categoría.' }
  }
}

export async function updateCategory(id, name, order, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const trimmedName = String(name || '').trim()
    if (!trimmedName) {
      return { success: false, error: 'El nombre no puede estar vacío.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)
    const category = await getOwnedCategory(restaurantId, id)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    const parsedOrder = parseInt(order, 10)

    await prisma.category.update({
      where: { id },
      data: {
        name: trimmedName,
        order: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
      },
    })

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Error al actualizar la categoría.' }
  }
}

export async function deleteCategory(id, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)
    const category = await getOwnedCategory(restaurantId, id)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    const productsCount = await prisma.product.count({
      where: { categoryId: id, restaurantId },
    })

    if (productsCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar esta categoría porque tiene ${productsCount} producto(s) asociado(s).`,
      }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidateRestaurantPaths(restaurant)
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Error al eliminar la categoría.' }
  }
}