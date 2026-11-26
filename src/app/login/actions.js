'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

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

  // Retornar success para que el cliente maneje el redirect
  return { success: true }
}