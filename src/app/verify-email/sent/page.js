import Link from 'next/link'

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
        <div className="text-amber-500 text-4xl mb-4">✉️</div>
        <h1 className="text-2xl font-black text-amber-500 tracking-tight mb-2">
          Revisa tu correo
        </h1>
        <p className="text-neutral-400 mb-6">
          Te enviamos un enlace de confirmación a tu correo electrónico. Abre el mensaje y haz clic en el botón para activar tu cuenta.
        </p>
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-500 mb-6">
          <p className="mb-2">¿No recibiste el correo?</p>
          <ul className="text-left space-y-1">
            <li>• Revisa tu carpeta de spam o correo no deseado.</li>
            <li>• Aseguraste de ingresar correctamente tu dirección de email.</li>
            <li>• El enlace expira en 24 horas.</li>
          </ul>
        </div>
        <Link
          href="/login"
          className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 rounded-xl transition"
        >
          Iniciar sesión
        </Link>
        <p className="mt-4 text-xs text-neutral-500">
          ¿Ya verificaste tu cuenta?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}