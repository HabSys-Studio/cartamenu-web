import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import ProductForm from '../../new-product/ProductForm'
import { auth } from '@/auth'
import { getUserRestaurants, getUserRestaurantAccess } from '@/lib/restaurant'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }) {
  const { id } = await params

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    redirect('/login')
  }

  const userRestaurants = await getUserRestaurants(userId)

  if (userRestaurants.length === 0) {
    return null
  }

  const allowedRestaurantIds = userRestaurants.map((r) => r.id)

  const product = await prisma.product.findFirst({
    where: {
      id,
      restaurantId: { in: allowedRestaurantIds },
    },
  })

  if (!product) {
    notFound()
  }

  const access = await getUserRestaurantAccess(userId, product.restaurantId)
  if (!access) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: product.restaurantId },
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
            Modificá los parámetros, cambiá la foto, ajustá la prioridad o reasigná categoría.
          </p>
        </div>

        <ProductForm
          categories={categories}
          restaurantId={product.restaurantId}
          initialData={product}
        />
      </div>
    </div>
  )
}