'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function createRestaurantAction(formData) {
  try {
    const session = await auth()
    const user = session?.user

    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Solo el administrador de la plataforma puede crear restaurantes.' }
    }

    const name = formData.get('name')
    const slug = formData.get('slug')
    const ownerEmail = formData.get('ownerEmail')

    if (!name || !slug || !ownerEmail) {
      return { success: false, error: 'Todos los campos son requeridos.' }
    }

    // Validar slug
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(String(slug))) {
      return { success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones.' }
    }

    // Verificar que el slug no exista
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: String(slug) },
    })

    if (existingRestaurant) {
      return { success: false, error: 'Este slug ya está en uso. Elige otro.' }
    }

    // Buscar o crear el usuario propietario
    let owner = await prisma.user.findUnique({
      where: { email: String(ownerEmail) },
    })

    if (!owner) {
      // Crear usuario temporal con contraseña aleatoria (deberá resetearla)
      const crypto = require('crypto')
      const tempPassword = crypto.randomBytes(16).toString('base64')
      const hashedPassword = await require('bcryptjs').hash(tempPassword, 12)

      owner = await prisma.user.create({
        data: {
          email: String(ownerEmail),
          password: hashedPassword,
          role: 'USER',
          plan: 'FREE',
          maxRestaurants: 1,
          emailVerified: false,
        },
      })
    }

    // Verificar que el usuario no haya alcanzado su límite
    const userRestaurants = await prisma.userRestaurant.count({
      where: { userId: owner.id },
    })

    if (userRestaurants >= owner.maxRestaurants) {
      return {
        success: false,
        error: `El usuario ${ownerEmail} ya ha alcanzado su límite de ${owner.maxRestaurants} restaurante(s).`,
      }
    }

    // Crear restaurante y asociar al usuario
    const restaurant = await prisma.$transaction(async (tx) => {
      const createdRestaurant = await tx.restaurant.create({
        data: {
          name: String(name),
          slug: String(slug),
          ownerId: owner.id,
        },
      })

      await tx.userRestaurant.create({
        data: {
          userId: owner.id,
          restaurantId: createdRestaurant.id,
          role: 'OWNER',
        },
      })

      return createdRestaurant
    })

    revalidatePath('/admin')
    revalidatePath('/admin/create-restaurant')

    return {
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      ownerEmail: owner.email,
      ownerWasCreated: !owner.emailVerified, // Si no estaba verificado, se creó nuevo
    }
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return { success: false, error: 'No se pudo crear el restaurante.' }
  }
}

export async function listAllRestaurants() {
  const session = await auth()
  const user = session?.user

  if (!user || user.role !== 'ADMIN') {
    return []
  }

  return prisma.restaurant.findMany({
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      users: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      _count: {
        select: { products: true, categories: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}