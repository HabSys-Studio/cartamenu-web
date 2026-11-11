import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-amber-500 hover:text-amber-400 font-bold text-sm mb-2 block">
            ← Volver al inicio
          </Link>
          <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
            Recuperar contraseña
          </h1>
          <p className="text-xs text-neutral-400">
            Ingresa tu correo y te enviaremos un enlace para restablecerla
          </p>
        </div>

        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 mb-8">
          <p className="text-xs text-neutral-500 mb-4">
            📧 <strong>Estado:</strong> Configuración de correo pendiente
          </p>
          <p className="text-sm text-neutral-400 mb-2">
            Esta función requiere un proveedor de email (Resend, SendGrid, etc.).
          </p>
          <p className="text-sm text-neutral-400">
            Mientras tanto, puedes contactar al administrador del sistema para restablecer tu acceso.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}