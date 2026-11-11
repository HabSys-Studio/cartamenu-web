'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentRestaurant, getOwnedCategory, getOwnedProduct } from '@/lib/restaurant'

// --- GESTIÓN DE PRODUCTOS ---

export async function saveProduct(formData) {
  try {
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

    const restaurant = await getCurrentRestaurant()
    const category = await getOwnedCategory(restaurant.id, categoryId)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    if (id) {
      const product = await getOwnedProduct(restaurant.id, id)
      if (!product) {
        return { success: false, error: 'El producto no pertenece a este local.' }
      }

      await prisma.product.update({
        where: { id },
        data: { name, description, price, categoryId, imageUrl, order, restaurantId: restaurant.id },
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
          restaurantId: restaurant.id,
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

export async function toggleProductAvailability(id, currentStatus) {
  try {
    const restaurant = await getCurrentRestaurant()
    const product = await getOwnedProduct(restaurant.id, id)

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

export async function deleteProduct(id) {
  try {
    const restaurant = await getCurrentRestaurant()
    const product = await getOwnedProduct(restaurant.id, id)

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

export async function createCategory(formData) {
  try {
    const name = formData.get('name')
    const orderInput = formData.get('order')
    const order = orderInput ? parseInt(orderInput, 10) : 0

    if (!name) {
      return { success: false, error: 'El nombre de la categoría es requerido.' }
    }

    const restaurant = await getCurrentRestaurant()

    await prisma.category.create({
      data: { name, order, restaurantId: restaurant.id },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'No se pudo crear la categoría.' }
  }
}

export async function updateCategory(id, name, order) {
  try {
    if (!name) {
      return { success: false, error: 'El nombre no puede estar vacío.' }
    }

    const restaurant = await getCurrentRestaurant()
    const category = await getOwnedCategory(restaurant.id, id)

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

export async function deleteCategory(id) {
  try {
    const restaurant = await getCurrentRestaurant()
    const category = await getOwnedCategory(restaurant.id, id)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este local.' }
    }

    const productsCount = await prisma.product.count({
      where: { categoryId: id, restaurantId: restaurant.id },
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