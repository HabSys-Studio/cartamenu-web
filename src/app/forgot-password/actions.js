'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function requestPasswordReset(prevState, formData) {
  const rawEmail = formData.get('email')
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : ''

  if (!email) {
    return { success: false, error: 'El correo es requerido.', message: null }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        success: true,
        error: null,
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
      }
    }

    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    const result = await sendPasswordResetEmail(email, token)

    if (!result.success) {
      return {
        success: false,
        error: 'No se pudo enviar el correo. Intentá de nuevo.',
        message: null,
      }
    }

    return {
      success: true,
      error: null,
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
    }
  } catch (error) {
    console.error('Request password reset error:', error)
    return {
      success: false,
      error: 'Ocurrió un error al procesar la solicitud.',
      message: null,
    }
  }
}