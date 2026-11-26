import { NextResponse } from 'next/server'
import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos.' },
        { status: 400 }
      )
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 401 }
      )
    }

    console.error('Error en POST /api/login:', error)
    return NextResponse.json(
      { error: 'Error interno al iniciar sesión.' },
      { status: 500 }
    )
  }
}