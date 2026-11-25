'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { sendEmailVerificationEmail } from '@/lib/email'

export async function registerUser(prevState, formData) {
  const name = formData.get('name')
  const email = formData.get('email')
  const confirmEmail = formData.get('confirmEmail')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  // Guardar los valores para rellenar el formulario si hay error
  const formValues = { name, email, confirmEmail, password, confirmPassword }

  if (!name || !email || !confirmEmail || !password || !confirmPassword) {
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

  // Verificar que el email no esté ya registrado
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { success: false, error: 'Este correo electrónico ya está registrado.' }
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(String(password), 12)

  // Generar token de verificación de email (válido 24 horas)
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  let verificationEmailError = null

  try {
    // Crear usuario (sin restaurante - el admin de plataforma asignará restaurantes después)
    const user = await prisma.$transaction(async (tx) => {
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

      return createdUser
    })

    // Enviar email de verificación
    try {
      await sendEmailVerificationEmail(email, verificationToken)
    } catch (e) {
      verificationEmailError = e instanceof Error ? e.message : 'Error desconocido'
      console.error('Verification email error:', e)
    }

    revalidatePath('/')

    const emailWarnings = []
    if (verificationEmailError) emailWarnings.push('No se pudo enviar el correo de verificación.')

    return {
      success: true,
      formValues: null,
      emailWarnings: emailWarnings.length > 0 ? emailWarnings : null,
    }
  } catch (error) {
    console.error('Error registering user:', error)
    return { success: false, error: 'No se pudo crear la cuenta. Intenta de nuevo.' }
  }
}