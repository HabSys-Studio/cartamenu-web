'use server'

import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function requestPasswordReset(formData) {
  const email = String(formData.get('email'))

  if (!email) {
    return { success: false, error: 'El correo es requerido.' }
  }

  // Verificar que el email exista en AdminUser
  const user = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (!user) {
    // Por seguridad, no revelamos si el email existe o no
    return { success: true, message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' }
  }

  // Invalidar tokens previos no usados de este email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  })

  // Generar token único
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  // Enviar email
  const result = await sendPasswordResetEmail(email, token)

  if (!result.success) {
    return { success: false, error: 'No se pudo enviar el correo. Intenta de nuevo.' }
  }

  return { success: true, message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.' }
}