'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Todos los campos son requeridos.' }
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email) },
    include: {
      restaurants: {
        include: { restaurant: true },
      },
    },
  })

  if (!user) {
    return { error: 'Credenciales inválidas.' }
  }

  const isValid = await bcrypt.compare(String(password), user.password)
  if (!isValid) {
    return { error: 'Credenciales inválidas.' }
  }

  // Establecer cookie de sesión simple
  const cookieStore = await cookies()
  cookieStore.set('carta-menu-session', JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    restaurants: user.restaurants.map((ur) => ({
      id: ur.restaurant.id,
      name: ur.restaurant.name,
      slug: ur.restaurant.slug,
    })),
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })

  return { success: true }
}