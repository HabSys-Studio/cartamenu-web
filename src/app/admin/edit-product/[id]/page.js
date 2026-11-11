import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '../../new-product/ProductForm'
import { getCurrentRestaurant } from '@/lib/restaurant'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }) {
  const { id } = await params

  const restaurant = await getCurrentRestaurant()

  const product = await prisma.product.findFirst({
    where: { id, restaurantId: restaurant.id },
  })

  if (!product) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="border-b border-neutral-800 pb-4">
          <h1 className="text-2xl font-black text-amber-500">
            Editar Producto: {product.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Modifica los parámetros, cambia la foto, ajusta la prioridad o reasigna categoría.
          </p>
        </div>

        {/* Formulario con datos iniciales precargados */}
        <ProductForm categories={categories} initialData={product} />

      </div>
    </div>
  )
}