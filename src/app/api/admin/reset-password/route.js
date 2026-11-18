import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return Response.json({ error: 'Faltan datos.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 12)

    const user = await prisma.adminUser.update({
      where: { email },
      data: { password: hashedPassword },
    })

    if (!user) {
      return Response.json({ error: 'Usuario no encontrado.' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin reset password error:', error)
    return Response.json({ error: 'Error interno.' }, { status: 500 })
  }
}
