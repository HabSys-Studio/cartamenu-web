'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function adminResetPasswordByEmail(email, newPassword) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No hay sesión activa.' }
    }

    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
      return {
        success: false,
        error: 'No tenés permisos para restablecer contraseñas de otros usuarios.',
      }
    }

    const normalizedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : ''
    const password = typeof newPassword === 'string' ? newPassword : ''

    if (!normalizedEmail || !password) {
      return { success: false, error: 'Faltan datos (correo y nueva contraseña).' }
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres.',
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en adminResetPasswordByEmail:', error)
    return { success: false, error: 'Error interno al restablecer la contraseña.' }
  }
}