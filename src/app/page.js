import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full tracking-wider mb-6 uppercase">
            Carta Menú — Menús Digitales para Restaurantes
          </span>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight">
            Tu carta,<br />
            <span className="text-amber-500">digitalizada en minutos.</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Crea el menú digital de tu restaurante, recibe pedidos online y administra tu carta desde cualquier lugar. Sin comisiones por pedido, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-lg transition shadow-lg"
            >
              Crear mi restaurante gratis
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold rounded-xl text-lg transition border border-neutral-700"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Qué es Carta Menú */}
      <section className="py-20 px-6 sm:px-12 bg-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Qué es Carta Menú?</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Es un ecosistema completo para que cada dueño de restaurante administre su propia carta digital, reciba pedidos y tenga su panel de administración privado con login.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Menú digital propio</h3>
              <p className="text-neutral-400 text-sm">
                Tu restaurante tiene su propia URL que puedes compartir en redes sociales y WhatsApp.
              </p>
            </div>
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Administra tu carta</h3>
              <p className="text-neutral-400 text-sm">
                Agrega, edita y elimina productos y categorías desde tu panel privado.
              </p>
            </div>
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Recibe pedidos</h3>
              <p className="text-neutral-400 text-sm">
                Tus clientes pueden agregar productos al carrito y enviarte su pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Desde la creación de tu cuenta hasta la gestión diaria de tu menú y pedidos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Panel privado por restaurante</h4>
                  <p className="text-neutral-500 text-sm">Cada dueño accede solo a su propia carta y pedidos.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Tema personalizable</h4>
                  <p className="text-neutral-500 text-sm">Colores de fondo, tarjetas, botones y textos a tu marca.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Sin comisiones por pedido</h4>
                  <p className="text-neutral-500 text-sm">Tú recibes el 100% de lo que tus clientes pagan.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Imágenes optimizadas</h4>
                  <p className="text-neutral-500 text-sm">Subida directa a Cloudinary con compresión automática.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Base de datos en la nube</h4>
                  <p className="text-neutral-500 text-sm">Neon PostgreSQL para tus datos, seguros y accesibles siempre.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-amber-500 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100">Despliegue en Vercel</h4>
                  <p className="text-neutral-500 text-sm">Tu aplicación publicada y accesible desde cualquier dispositivo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="py-20 px-6 sm:px-12 bg-neutral-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Precios simples</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">
              Sin sorpresas. Elige el plan que mejor se adapte a tu restaurante.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-950 p-8 rounded-xl border border-neutral-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Inicial</h3>
              <div className="text-3xl font-black mb-6">Gratis<span className="text-neutral-500 text-lg"> / mes</span></div>
              <ul className="space-y-3 text-neutral-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> 1 restaurante</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Hasta 50 productos</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Panel de administración</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Menú digital público</li>
              </ul>
              <Link href="/register" className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-center transition border border-neutral-700">
                Empezar gratis
              </Link>
            </div>
            <div className="bg-neutral-950 p-8 rounded-xl border border-amber-500/30 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 px-3 py-1 rounded-full text-xs font-bold uppercase">Más popular</div>
              <h3 className="text-xl font-bold mb-2">Profesional</h3>
              <div className="text-3xl font-black mb-6">$9.99<span className="text-neutral-500 text-lg"> / mes</span></div>
              <ul className="space-y-3 text-neutral-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> 3 restaurantes</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Productos ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Panel de administración</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Menú digital público</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Soporte prioritario</li>
              </ul>
              <Link href="/register" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-center transition shadow-lg">
                Empezar ahora
              </Link>
            </div>
            <div className="bg-neutral-950 p-8 rounded-xl border border-neutral-800 flex flex-col">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-black mb-6">Contactar<span className="text-neutral-500 text-lg"> / mes</span></div>
              <ul className="space-y-3 text-neutral-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Restaurantes ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Dominio personalizado</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Panel multi-local</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> API e integraciones</li>
                <li className="flex items-center gap-2"><span className="text-amber-500">✓</span> Soporte dedicado 24/7</li>
              </ul>
              <button className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-center transition border border-neutral-700">
                Solicitar demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 sm:px-12">
        <div className="max-w-3xl mx-auto text-center bg-amber-500/10 rounded-2xl p-10 border border-amber-500/20">
          <h2 className="text-3xl font-bold mb-4 text-neutral-100">¿Listo para digitalizar tu restaurante?</h2>
          <p className="text-neutral-400 mb-8">Crea tu cuenta en menos de 2 minutos y publica tu menú hoy mismo.</p>
          <Link
            href="/register"
            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-xl text-lg transition shadow-xl"
          >
            Crear mi restaurante
          </Link>
        </div>
      </section>
    </div>
  )
}