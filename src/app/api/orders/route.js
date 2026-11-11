import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { restaurantId, customerName, customerPhone, customerEmail, items, total } = body

    if (!restaurantId || !items || items.length === 0 || !total) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 })
    }

    // Crear la orden y sus ítems en una transacción
    const order = await prisma.order.create({
      data: {
        restaurantId,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        total: parseFloat(total),
        status: 'pending',
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notas || null,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error al crear la orden.' }, { status: 500 })
  }
}