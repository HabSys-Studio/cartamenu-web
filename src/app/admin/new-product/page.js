import { prisma } from '@/lib/prisma'
import ProductForm from './ProductForm'
import Link from 'next/link'
import { getCurrentRestaurant } from '@/lib/restaurant'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  // Obtenemos las categorías existentes para alimentar el selector
  const restaurant = await getCurrentRestaurant()

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-amber-500 tracking-tight">
              Nuevo Producto
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Agrega un nuevo ítem a la carta digital de tu comercio.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-xs font-bold text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl transition"
          >
            ← Volver al Panel
          </Link>
        </div>

        {/* Formulario */}
        <ProductForm categories={categories} />

      </div>
    </div>
  )
}