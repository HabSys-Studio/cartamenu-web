import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const restaurantId =
      typeof body?.restaurantId === 'string' ? body.restaurantId.trim() : ''
    const items = Array.isArray(body?.items) ? body.items : []

    const customerName =
      typeof body?.customerName === 'string' && body.customerName.trim()
        ? body.customerName.trim()
        : null
    const customerPhone =
      typeof body?.customerPhone === 'string' && body.customerPhone.trim()
        ? body.customerPhone.trim()
        : null
    const customerEmail =
      typeof body?.customerEmail === 'string' && body.customerEmail.trim()
        ? body.customerEmail.trim().toLowerCase()
        : null

    if (!restaurantId || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos: faltan restaurantId o ítems.' },
        { status: 400 }
      )
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, isActive: true },
    })

    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json(
        { error: 'El restaurante no existe o no está disponible.' },
        { status: 404 }
      )
    }

    // Consolidar cantidades por productId y validar cantidades positivas
    const quantityByProductId = new Map()
    const notesByProductId = new Map()

    for (const item of items) {
      const productId = typeof item?.id === 'string' ? item.id.trim() : ''
      const qty = Number(item?.quantity)

      if (!productId || !Number.isInteger(qty) || qty <= 0) {
        return NextResponse.json(
          { error: 'Hay productos con ID o cantidad inválida.' },
          { status: 400 }
        )
      }

      quantityByProductId.set(
        productId,
        (quantityByProductId.get(productId) ?? 0) + qty
      )

      const rawNote = item?.notas ?? item?.notes
      if (typeof rawNote === 'string' && rawNote.trim()) {
        notesByProductId.set(productId, rawNote.trim())
      }
    }

    const productIds = Array.from(quantityByProductId.keys())

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        restaurantId,
      },
      select: {
        id: true,
        price: true,
        isAvailable: true,
        name: true,
      },
    })

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Uno o más productos no pertenecen a este restaurante.' },
        { status: 400 }
      )
    }

    const unavailableProduct = dbProducts.find((p) => p.isAvailable === false)
    if (unavailableProduct) {
      return NextResponse.json(
        { error: `El producto "${unavailableProduct.name}" no está disponible.` },
        { status: 400 }
      )
    }

    let serverTotal = 0
    const orderItemsData = dbProducts.map((product) => {
      const quantity = quantityByProductId.get(product.id)
      const unitPrice = Number(product.price)
      serverTotal += unitPrice * quantity

      return {
        productId: product.id,
        quantity,
        price: unitPrice,
        notes: notesByProductId.get(product.id) ?? null,
      }
    })

    const roundedTotal = Number(serverTotal.toFixed(2))

    const order = await prisma.order.create({
      data: {
        restaurantId,
        customerName,
        customerPhone,
        customerEmail,
        total: roundedTotal,
        status: 'pending',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(
      { success: true, orderId: order.id, total: order.total },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden.' },
      { status: 500 }
    )
  }
}