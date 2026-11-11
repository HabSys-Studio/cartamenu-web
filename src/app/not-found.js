import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-amber-500 mb-2">404</h1>
      <h2 className="text-xl font-bold text-neutral-200 mb-4">Página no encontrada</h2>
      <p className="text-sm text-neutral-400 max-w-sm mb-6">
        La sección o recurso al que intentas acceder no existe o se ha movido.
      </p>
      <Link 
        href="/admin/login" 
        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-sm transition"
      >
        Ir al Login de Administración
      </Link>
    </div>
  )
}