'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getUserRestaurantAccess, getOwnedCategory, getOwnedProduct } from '@/lib/restaurant'

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

// --- GESTIÓN DE PRODUCTOS ---

export async function saveProduct(formData, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)

    const id = formData.get('id')
    const name = formData.get('name')
    const description = formData.get('description') || ''
    const price = parseFloat(formData.get('price'))
    const categoryId = formData.get('categoryId')
    const imageUrl = formData.get('imageUrl') || ''
    const orderInput = formData.get('order')
    const order = orderInput ? parseInt(orderInput, 10) : 0

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: 'Por favor completa los campos obligatorios.' }
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

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error saving product:', error)
    return { success: false, error: 'Error al guardar el producto en la base de datos.' }
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
      data: { available: !currentStatus },
    })

    revalidatePath('/')
    revalidatePath('/admin')
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

    revalidatePath('/')
    revalidatePath('/admin')
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

    const name = formData.get('name')
    const orderInput = formData.get('order')
    const order = orderInput ? parseInt(orderInput, 10) : 0

    if (!name) {
      return { success: false, error: 'El nombre de la categoría es requerido.' }
    }

    await prisma.category.create({
      data: { name, order, restaurantId },
    })

    revalidatePath('/')
    revalidatePath('/admin')
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

    if (!name) {
      return { success: false, error: 'El nombre no puede estar vacío.' }
    }

    const restaurant = await getRestaurantFromSession(userId, restaurantId)
    const category = await getOwnedCategory(restaurantId, id)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    await prisma.category.update({
      where: { id },
      data: { 
        name, 
        order: parseInt(order, 10) || 0 
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
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
        error: `No se puede eliminar esta categoría porque tiene ${productsCount} producto(s) asociado(s).` 
      }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Error al eliminar la categoría.' }
  }
}