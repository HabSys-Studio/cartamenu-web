'use server'

import { v2 as cloudinary } from 'cloudinary'
import { getCurrentRestaurant } from '@/lib/restaurant'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImageAction(formData) {
  try {
    const file = formData.get('file')

    if (!file || file.size === 0) {
      throw new Error('No se ha proporcionado ningún archivo válido.')
    }

    // Validar tipo de archivo (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF).')
    }

    // Validar tamaño máximo (2 MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('La imagen no puede superar los 2 MB.')
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const restaurant = await getCurrentRestaurant()

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `carta-menu/${restaurant.slug}`,
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return { success: true, url: result.secure_url }
  } catch (error) {
    console.error('Error al subir la imagen a Cloudinary:', error)
    return { success: false, error: error.message }
  }
}