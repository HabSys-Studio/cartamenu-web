import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import {
  requireSession,
  handleApiAuthError,
} from '@/lib/restaurant-access'

export async function POST(req) {
  try {
    const session = await requireSession()

    // Solo usuarios con rol global SUPERADMIN o ADMIN pueden forzar restablecimiento desde este endpoint
    if (!['SUPERADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No tenés permisos para restablecer contraseñas de otros usuarios.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const newPassword =
      typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Faltan datos (email y newPassword).' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiAuthError(error)
  }
}