'use server'

import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Extrae el public_id de una URL de Cloudinary para permitir su eliminación.
 * Ejemplo: https://res.cloudinary.com/demo/image/upload/v123456/carta-menu-products/sample.jpg
 * Retorna: carta-menu-products/sample
 */
function getPublicIdFromUrl(url) {
  if (!url) return null
  try {
    const parts = url.split('/')
    const folderAndFile = parts.slice(-2).join('/') // Captura 'folder/filename.ext'
    return folderAndFile.split('.')[0] // Remueve la extensión (.jpg, .png, etc.)
  } catch (error) {
    console.error('Error al parsear public_id de Cloudinary:', error)
    return null
  }
}

/**
 * Action: Crear un nuevo producto con subida opcional de imagen a Cloudinary.
 */
export async function createProductAction(formData) {
  try {
    const name = formData.get('name')
    const description = formData.get('description')
    const price = parseFloat(formData.get('price'))
    const categoryId = formData.get('categoryId')
    const file = formData.get('image')

    if (!name || isNaN(price) || !categoryId) {
      return { success: false, error: 'Los campos Nombre, Precio y Categoría son obligatorios y válidos.' }
    }

    let imageUrl = null

    // Procesar subida de imagen a Cloudinary si existe un archivo válido
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'carta-menu-products',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      imageUrl = uploadResult.secure_url
    }

    // Guardar en SQLite vía Prisma
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        categoryId,
        available: true,
      },
    })

    // Revalidar cachés para actualizar la UI del cliente y la del admin
    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error en createProductAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Action: Eliminar un producto de la base de datos y su imagen remota en Cloudinary.
 */
export async function deleteProductAction(productId) {
  try {
    if (!productId) {
      return { success: false, error: 'Identificador de producto no provisto.' }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'El producto a eliminar no existe.' }
    }

    // Borrado físico del recurso en Cloudinary si proviene de dicho proveedor
    if (product.imageUrl && product.imageUrl.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(product.imageUrl)
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
    }

    // Borrado en la base de datos
    await prisma.product.delete({
      where: { id: productId },
    })

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error en deleteProductAction:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Action: Alternar la disponibilidad (Disponible / Agotado) de un producto.
 */
export async function toggleProductAvailabilityAction(productId, currentStatus) {
  try {
    if (!productId) {
      return { success: false, error: 'Identificador de producto no provisto.' }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { available: !currentStatus },
    })

    revalidatePath('/')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error en toggleProductAvailabilityAction:', error)
    return { success: false, error: error.message }
  }
}