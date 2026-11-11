'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function registerRestaurant(formData) {
  const name = formData.get('name')
  const slug = formData.get('slug')
  const email = formData.get('email')
  const password = formData.get('password')

  if (!name || !slug || !email || !password) {
    return { success: false, error: 'Todos los campos son requeridos.' }
  }

  // Validar formato del slug (solo letras, números y guiones)
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return { success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones.' }
  }

  // Verificar que el slug no exista
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { slug },
  })

  if (existingRestaurant) {
    return { success: false, error: 'Este slug ya está en uso. Elige otro.' }
  }

  // Verificar que el email no exista
  const existingUser = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { success: false, error: 'Ya existe un usuario con este email.' }
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(String(password), 12)

  // Crear restaurante y admin en una transacción
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug,
        ...defaultTheme,
      },
    })

    await prisma.adminUser.create({
      data: {
        email,
        password: hashedPassword,
        restaurantId: restaurant.id,
      },
    })

    revalidatePath('/')
    redirect('/admin/login?registered=1')
  } catch (error) {
    console.error('Error registering restaurant:', error)
    return { success: false, error: 'No se pudo registrar el restaurante. Intenta de nuevo.' }
  }
}