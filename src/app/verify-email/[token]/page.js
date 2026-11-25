import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function VerifyEmailPage({ params }) {
  const { token } = params

  if (!token) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-black text-rose-500 mb-2">Enlace inválido</h1>
          <p className="text-neutral-400 mb-6">No se proporcionó un token de verificación.</p>
          <a href="/login" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition">
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }

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
            <a href="/login" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition">
              Iniciar sesión
            </a>
          </div>
        </div>
      )
    }

    if (verificationToken.expires < new Date()) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <h1 className="text-2xl font-black text-rose-500 mb-2">Enlace expirado</h1>
            <p className="text-neutral-400 mb-6">El enlace de verificación ha expirado. Solicita uno nuevo desde el inicio de sesión.</p>
            <a href="/login" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition">
              Iniciar sesión
            </a>
          </div>
        </div>
      )
    }

    // Marcar el email como verificado
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: true },
    })

    // Eliminar el token usado
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    redirect('/login?verified=1')
  } catch (error) {
    console.error('Email verification error:', error)
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
          <h1 className="text-2xl font-black text-rose-500 mb-2">Error al verificar</h1>
          <p className="text-neutral-400 mb-6">Ocurrió un error al procesar tu solicitud. Intenta de nuevo.</p>
          <a href="/login" className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-6 rounded-xl transition">
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }
}