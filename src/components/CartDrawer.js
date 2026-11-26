'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'

export default function CartDrawer({ settings }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState('takeaway') // 'takeaway' | 'delivery'
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo') // 'efectivo' | 'transferencia'

  const {
    cart,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const accentColor = settings?.menuTitleColor || '#f59e0b'
  const drawerBg = settings?.searchBgColor || '#171717'
  const cardBg = settings?.cardBgColor || '#0a0a0a'
  const textColor = settings?.cardTitleColor || '#ededed'
  const descColor = settings?.cardDescColor || '#a3a3a3'
  const btnColor = settings?.cardBtnColor || '#f59e0b'
  const btnTextColor = settings?.cardBtnTextColor || '#0a0a0a'

  // ⚠️ REEMPLAZAR CON EL NÚMERO REAL DEL COMERCIO CON CÓDIGO DE PAÍS (Ej: 549...)
  const PHONE_NUMBER = '5493826000000'

  const handleSendOrder = (e) => {
    e.preventDefault()

    if (cart.length === 0) return

    let orderMessage = `🛒 *NUEVO PEDIDO - CARTA MENÚ*\n\n`
    orderMessage += `👤 *Cliente:* ${customerName.trim() || 'No especificado'}\n`
    orderMessage += `🛵 *Modalidad:* ${
      deliveryMethod === 'delivery' ? 'Envío a Domicilio' : 'Retiro en Local'
    }\n`

    if (deliveryMethod === 'delivery' && address.trim()) {
      orderMessage += `📍 *Dirección:* ${address.trim()}\n`
    }

    orderMessage += `💳 *Medio de Pago:* ${
      paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'
    }\n`
    orderMessage += `\n---\n📝 *DETALLE DEL PEDIDO:*\n`

    cart.forEach((item) => {
      const itemTotal = (Number(item.price) || 0) * item.quantity
      orderMessage += `• ${item.quantity}x ${item.name} — $${itemTotal.toLocaleString(
        'es-AR'
      )}\n`
    })

    orderMessage += `\n---\n💰 *TOTAL A PAGAR:* $${totalPrice.toLocaleString(
      'es-AR',
      {
        minimumFractionDigits: 2,
      }
    )}\n\n`
    orderMessage += `¡Muchas gracias!`

    const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
      orderMessage
    )}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="font-black px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition transform active:scale-95 border-2"
            style={{
              backgroundColor: btnColor,
              color: btnTextColor,
              borderColor: drawerBg,
            }}
          >
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ backgroundColor: drawerBg, color: accentColor }}
            >
              {totalItems}
            </span>
            <span>Ver Mi Pedido</span>
            <span className="text-sm">
              ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md border-l h-full flex flex-col justify-between p-6 overflow-y-auto"
            style={{ backgroundColor: drawerBg, borderColor: btnColor + '33' }}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold" style={{ color: accentColor }}>
                  Tu Pedido
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-xl px-2 transition hover:opacity-70"
                  style={{ color: descColor }}
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p
                    className="text-sm italic text-center py-8"
                    style={{ color: descColor }}
                  >
                    El carrito está vacío.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 flex items-center justify-between"
                      style={{
                        backgroundColor: cardBg,
                        borderColor: btnColor + '22',
                      }}
                    >
                      <div>
                        <h4
                          className="text-sm font-bold"
                          style={{ color: textColor }}
                        >
                          {item.name}
                        </h4>
                        <p
                          className="text-xs font-semibold mt-0.5"
                          style={{ color: accentColor }}
                        >
                          $
                          {(
                            (Number(item.price) || 0) * item.quantity
                          ).toLocaleString('es-AR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 font-bold rounded flex items-center justify-center text-xs transition"
                          style={{ backgroundColor: drawerBg, color: textColor }}
                        >
                          -
                        </button>
                        <span
                          className="text-xs font-bold w-4 text-center"
                          style={{ color: textColor }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 font-bold rounded flex items-center justify-center text-xs transition"
                          style={{ backgroundColor: drawerBg, color: textColor }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFromCart(item.id)}
                          className="text-rose-500 hover:text-rose-400 ml-2 text-xs font-bold"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <form
                  onSubmit={handleSendOrder}
                  className="mt-6 space-y-4 border-t border-neutral-800 pt-4"
                >
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1"
                      style={{ color: textColor }}
                    >
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: María Gonzáles"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-xs focus:outline-none"
                      style={{
                        backgroundColor: cardBg,
                        borderColor: btnColor + '44',
                        color: textColor,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: textColor }}
                      >
                        Entrega
                      </label>
                      <select
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-full border rounded-lg p-2.5 text-xs focus:outline-none"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: btnColor + '44',
                          color: textColor,
                        }}
                      >
                        <option value="takeaway">Retiro en Local</option>
                        <option value="delivery">Envío Domicilio</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: textColor }}
                      >
                        Pago
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full border rounded-lg p-2.5 text-xs focus:outline-none"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: btnColor + '44',
                          color: textColor,
                        }}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div>
                      <label
                        className="block text-xs font-semibold mb-1"
                        style={{ color: textColor }}
                      >
                        Dirección de Entrega
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle y número, barrio..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border rounded-lg p-2.5 text-xs focus:outline-none"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: btnColor + '44',
                          color: textColor,
                        }}
                      />
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-black text-xs transition shadow-lg active:scale-95"
                      style={{
                        backgroundColor: btnColor,
                        color: btnTextColor,
                      }}
                    >
                      Enviar Pedido por WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={clearCart}
                      className="w-full py-2 rounded-xl font-bold text-xs border border-neutral-800 hover:bg-neutral-800/60 transition"
                      style={{ color: descColor }}
                    >
                      Vaciar Carrito
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}