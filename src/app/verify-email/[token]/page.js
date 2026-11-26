import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function VerifyEmailPage({ params }) {
  const resolvedParams = await params
  const token = resolvedParams?.token

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-black text-rose-500 mb-2">Enlace inválido</h1>
          <p className="text-neutral-400 mb-6">No se proporcionó un token de verificación.</p>
          <Link
            href="/login"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  let verifiedSuccessfully = false

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <h1 className="text-2xl font-black text-rose-500 mb-2">Enlace inválido</h1>
            <p className="text-neutral-400 mb-6">El token de verificación no existe o ya fue utilizado.</p>
            <Link
              href="/login"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      )
    }

    if (verificationToken.expires < new Date()) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <h1 className="text-2xl font-black text-rose-500 mb-2">Enlace expirado</h1>
            <p className="text-neutral-400 mb-6">
              El enlace de verificación ha expirado. Solicitá uno nuevo desde el inicio de sesión.
            </p>
            <Link
              href="/login"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      )
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ])

    verifiedSuccessfully = true
  } catch (error) {
    console.error('Email verification error:', error)
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-black text-rose-500 mb-2">Error al verificar</h1>
          <p className="text-neutral-400 mb-6">Ocurrió un error al procesar tu solicitud. Intentá de nuevo.</p>
          <Link
            href="/login"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (verifiedSuccessfully) {
    redirect('/login?verified=1')
  }
}