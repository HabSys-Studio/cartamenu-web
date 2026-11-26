'use server'

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

const ALLOWED_PLATFORM_ROLES = ['ADMIN', 'SUPERADMIN']

export async function createRestaurantAction(prevState, formData) {
  try {
    const session = await auth()
    const user = session?.user

    if (!user || !ALLOWED_PLATFORM_ROLES.includes(user.role)) {
      return {
        success: false,
        error: 'Solo el administrador de la plataforma puede crear restaurantes.',
      }
    }

    const name = String(formData.get('name') || '').trim()
    const slug = String(formData.get('slug') || '').trim().toLowerCase()
    const ownerEmail = String(formData.get('ownerEmail') || '').trim().toLowerCase()

    if (!name || !slug || !ownerEmail) {
      return { success: false, error: 'Todos los campos son requeridos.' }
    }

    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return {
        success: false,
        error: 'El slug solo puede contener letras minúsculas, números y guiones.',
      }
    }

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug },
    })

    if (existingRestaurant) {
      return {
        success: false,
        error: 'Este slug ya está en uso. Elegí otro.',
      }
    }

    let owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    })

    let createdNewOwner = false

    if (!owner) {
      const tempPassword = crypto.randomBytes(16).toString('base64')
      const hashedPassword = await bcrypt.hash(tempPassword, 12)

      owner = await prisma.user.create({
        data: {
          name: ownerEmail.split('@')[0],
          email: ownerEmail,
          password: hashedPassword,
          role: 'USER',
          plan: 'FREE',
          maxRestaurants: 1,
          emailVerified: false,
        },
      })
      createdNewOwner = true
    }

    const userRestaurantsCount = await prisma.userRestaurant.count({
      where: { userId: owner.id },
    })

    if (userRestaurantsCount >= owner.maxRestaurants) {
      return {
        success: false,
        error: `El usuario ${ownerEmail} ya ha alcanzado su límite de ${owner.maxRestaurants} restaurante(s).`,
      }
    }

    const restaurant = await prisma.$transaction(async (tx) => {
      const createdRestaurant = await tx.restaurant.create({
        data: {
          name,
          slug,
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
      ownerWasCreated: createdNewOwner,
    }
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return { success: false, error: 'No se pudo crear el restaurante.' }
  }
}

export async function listAllRestaurants() {
  const session = await auth()
  const user = session?.user

  if (!user || !ALLOWED_PLATFORM_ROLES.includes(user.role)) {
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