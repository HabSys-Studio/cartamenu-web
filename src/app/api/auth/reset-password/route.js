import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña son requeridos.' }, { status: 400 })
    }

    // Buscar el token válido y no expirado
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })
    }

    if (resetToken.expires < new Date()) {
      return NextResponse.json({ error: 'El token ha expirado.' }, { status: 400 })
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Actualizar contraseña del usuario
    await prisma.adminUser.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    })

    // Invalidar el token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return NextResponse.json({ success: true, message: 'Contraseña restablecida correctamente.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Error al restablecer la contraseña.' }, { status: 500 })
  }
}