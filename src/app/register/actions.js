'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { sendWelcomeEmail, sendEmailVerificationEmail } from '@/lib/email'

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

export async function registerRestaurant(prevState, formData) {
  const name = formData.get('name')
  const slug = formData.get('slug')
  const email = formData.get('email')
  const confirmEmail = formData.get('confirmEmail')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  // Guardar los valores para rellenar el formulario si hay error
  const formValues = { name, slug, email, confirmEmail, password, confirmPassword }

  if (!name || !slug || !email || !confirmEmail || !password || !confirmPassword) {
    return { success: false, error: 'Todos los campos son requeridos.', formValues }
  }

  // Validar que los emails coincidan
  if (email !== confirmEmail) {
    return { success: false, error: 'Los correos electrónicos no coinciden. Verificá ambos campos.', formValues }
  }

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    return { success: false, error: 'Las contraseñas no coinciden. Verificá ambos campos.', formValues }
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

    // Generar token de verificación de email (válido 24 horas)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.create({
      data: {
        email,
        token: verificationToken,
        expires,
      },
    })

    // Enviar email de bienvenida (no bloquea el registro si falla)
    await sendWelcomeEmail(email, name)

    // Enviar email de verificación de cuenta
    await sendEmailVerificationEmail(email, verificationToken)

    revalidatePath('/')
    return { success: true, formValues: null }
  } catch (error) {
    console.error('Error registering restaurant:', error)
    return { success: false, error: 'No se pudo registrar el restaurante. Intenta de nuevo.' }
  }
}