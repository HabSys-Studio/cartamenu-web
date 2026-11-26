'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { sendEmailVerificationEmail } from '@/lib/email'

export async function registerUser(prevState, formData) {
  const rawName = formData.get('name')
  const rawEmail = formData.get('email')
  const rawConfirmEmail = formData.get('confirmEmail')
  const rawPassword = formData.get('password')
  const rawConfirmPassword = formData.get('confirmPassword')

  const name = typeof rawName === 'string' ? rawName.trim() : ''
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''
  const confirmEmail =
    typeof rawConfirmEmail === 'string' ? rawConfirmEmail.trim().toLowerCase() : ''
  const password = typeof rawPassword === 'string' ? rawPassword : ''
  const confirmPassword =
    typeof rawConfirmPassword === 'string' ? rawConfirmPassword : ''

  const formValues = {
    name,
    email,
    confirmEmail,
    password,
    confirmPassword,
  }

  if (!name || !email || !confirmEmail || !password || !confirmPassword) {
    return {
      success: false,
      error: 'Todos los campos son requeridos.',
      formValues,
    }
  }

  if (email !== confirmEmail) {
    return {
      success: false,
      error: 'Los correos electrónicos no coinciden. Verificá ambos campos.',
      formValues,
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres.',
      formValues,
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Las contraseñas no coinciden. Verificá ambos campos.',
      formValues,
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return {
      success: false,
      error: 'Este correo electrónico ya está registrado.',
      formValues,
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  try {
    await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'USER',
          plan: 'FREE',
          maxRestaurants: 1,
          emailVerified: false,
        },
      })

      await tx.verificationToken.create({
        data: {
          email,
          token: verificationToken,
          expires,
          userId: createdUser.id,
        },
      })
    })

    const emailWarnings = []
    const mailResult = await sendEmailVerificationEmail(email, verificationToken)
    if (!mailResult.success) {
      emailWarnings.push('No se pudo enviar el correo de verificación.')
    }

    revalidatePath('/')

    return {
      success: true,
      formValues: null,
      emailWarnings: emailWarnings.length > 0 ? emailWarnings : null,
    }
  } catch (error) {
    console.error('Error registering user:', error)
    return {
      success: false,
      error: 'No se pudo crear la cuenta. Intentá de nuevo.',
      formValues,
    }
  }
}