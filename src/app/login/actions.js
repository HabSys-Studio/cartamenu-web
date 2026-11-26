'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function loginAction(formData) {
  try {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
      return { error: 'Todos los campos son requeridos.' }
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return { success: true }
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: 'Credenciales inválidas.' }
    }
    console.error('Error en loginAction:', err)
    return { error: 'Ocurrió un error al iniciar sesión.' }
  }
}