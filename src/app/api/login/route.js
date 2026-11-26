import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Todos los campos son requeridos.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
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
    return new Response(
      JSON.stringify({ error: 'Credenciales inválidas.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const isValid = await bcrypt.compare(String(password), user.password)
  if (!isValid) {
    return new Response(
      JSON.stringify({ error: 'Credenciales inválidas.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Establecer cookie de sesión
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

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}