'use server'

import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import {
  getUserRestaurantAccess,
  getOwnedCategory,
  getOwnedProduct,
} from '@/lib/restaurant'

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

/**
 * Extrae el public_id de una URL de Cloudinary para permitir su eliminación.
 * Soporta carpetas simples y anidadas (ej: carta-menu-products/sample o carta-menu/slug/sample).
 */
function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const uploadMarker = '/upload/'
    const uploadIndex = url.indexOf(uploadMarker)
    if (uploadIndex === -1) return null

    let pathAfterUpload = url.slice(uploadIndex + uploadMarker.length)
    // Quitar versión opcional (ej: v1700000000/)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '')
    // Quitar query params si hubiera
    pathAfterUpload = pathAfterUpload.split('?')[0]
    // Quitar extensión (.jpg, .png, .webp, etc.)
    const lastDotIndex = pathAfterUpload.lastIndexOf('.')
    return lastDotIndex > 0
      ? pathAfterUpload.slice(0, lastDotIndex)
      : pathAfterUpload
  } catch (error) {
    console.error('Error al parsear public_id de Cloudinary:', error)
    return null
  }
}

/**
 * Action: Crear un nuevo producto con subida opcional de imagen a Cloudinary.
 */
export async function createProductAction(formData, restaurantId) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const name = String(formData.get('name') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const price = parseFloat(formData.get('price'))
    const categoryId = String(formData.get('categoryId') || '').trim()
    const file = formData.get('image')

    if (!name || Number.isNaN(price) || price < 0 || !categoryId) {
      return {
        success: false,
        error: 'Los campos Nombre, Precio y Categoría son obligatorios y válidos.',
      }
    }

    const restaurant = await getUserRestaurantAccess(userId, restaurantId)
    if (!restaurant) {
      return { success: false, error: 'No tienes acceso a este restaurante.' }
    }

    const category = await getOwnedCategory(restaurantId, categoryId)

    if (!category) {
      return { success: false, error: 'La categoría no pertenece a este restaurante.' }
    }

    let imageUrl = null

    if (file && typeof file !== 'string' && file.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF).',
        }
      }

      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        return { success: false, error: 'La imagen no puede superar los 2 MB.' }
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'carta-menu-products',
              transformation: [
                {
                  width: 800,
                  height: 800,
                  crop: 'limit',
                  quality: 'auto',
                  fetch_format: 'auto',
                },
              ],
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
          .end(buffer)
      })

      imageUrl = uploadResult.secure_url
    }

    await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        categoryId,
        restaurantId,
        available: true,
      },
    })

    revalidateRestaurantPaths(restaurant)

    return { success: true }
  } catch (error) {
    console.error('Error en createProductAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Action: Eliminar un producto de la base de datos y su imagen remota en Cloudinary.
 */
export async function deleteProductAction(productId, restaurantId) {
  try {
    if (!productId) {
      return { success: false, error: 'Identificador de producto no provisto.' }
    }

    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getUserRestaurantAccess(userId, restaurantId)
    if (!restaurant) {
      return { success: false, error: 'No tienes acceso a este restaurante.' }
    }

    const product = await getOwnedProduct(restaurantId, productId)

    if (!product) {
      return { success: false, error: 'El producto no pertenece a este restaurante.' }
    }

    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(product.imageUrl)
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    })

    revalidateRestaurantPaths(restaurant)

    return { success: true }
  } catch (error) {
    console.error('Error en deleteProductAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Action: Alternar la disponibilidad (Disponible / Agotado) de un producto.
 */
export async function toggleProductAvailabilityAction(
  productId,
  currentStatus,
  restaurantId
) {
  try {
    if (!productId) {
      return { success: false, error: 'Identificador de producto no provisto.' }
    }

    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, error: 'No hay sesión de administrador activa.' }
    }

    const restaurant = await getUserRestaurantAccess(userId, restaurantId)
    if (!restaurant) {
      return { success: false, error: 'No tienes acceso a este restaurante.' }
    }

    const product = await getOwnedProduct(restaurantId, productId)

    if (!product) {
      return { success: false, error: 'El producto no pertenece a este restaurante.' }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { available: !product.available },
    })

    revalidateRestaurantPaths(restaurant)

    return { success: true }
  } catch (error) {
    console.error('Error en toggleProductAvailabilityAction:', error)
    return { success: false, error: error.message }
  }
}