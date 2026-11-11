'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'

export default function ProductCard({ product, settings, onAddToCart }) {
  const { id, name, description, price, imageUrl, available } = product
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)

  const [imgError, setImgError] = useState(false)

  const cartItem = cart.find((item) => item.id === id)
  const quantityInCart = cartItem ? cartItem.quantity : 0

  const handleAdd = () => {
    addToCart(product)
    if (onAddToCart) onAddToCart()
  }

  // Colores dinámicos de la tarjeta configurados por el administrador
  const cardBg = settings?.cardBgColor || '#171717'
  const cardTitle = settings?.cardTitleColor || '#ededed'
  const cardDesc = settings?.cardDescColor || '#a3a3a3'
  const cardPrice = settings?.cardPriceColor || '#f59e0b'
  const cardBtnBg = settings?.cardBtnColor || '#f59e0b'
  const cardBtnText = settings?.cardBtnTextColor || '#0a0a0a'

  return (
    <article 
      className="border rounded-xl overflow-hidden flex flex-col justify-between transition shadow-lg group"
      style={{ backgroundColor: cardBg, borderColor: cardBtnBg + '33' }}
    >
      <div>
        <div className="relative w-full h-48 bg-neutral-950 overflow-hidden">
          {imageUrl && !imgError ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
              className={`object-cover group-hover:scale-105 transition duration-300 ${
                !available ? 'opacity-40 grayscale' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs font-semibold uppercase tracking-wider bg-neutral-900">
              Sin imagen
            </div>
          )}

          {!available && (
            <div className="absolute top-3 right-3 bg-rose-950/90 border border-rose-700 text-rose-300 text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-md">
              Agotado
            </div>
          )}

          {quantityInCart > 0 && available && (
            <div 
              className="absolute top-3 left-3 font-black text-xs px-2.5 py-1 rounded-md shadow-md"
              style={{ backgroundColor: cardPrice, color: cardBg }}
            >
              {quantityInCart} en carrito
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 
            className="text-lg font-bold transition"
            style={{ color: cardTitle }}
          >
            {name}
          </h3>
          {description && (
            <p 
              className="text-sm mt-1.5 line-clamp-2 leading-relaxed"
              style={{ color: cardDesc }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center justify-between mt-2">
        <span 
          className="text-xl font-extrabold"
          style={{ color: cardPrice }}
        >
          ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>

        <button
          onClick={handleAdd}
          disabled={!available}
          className="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: available ? cardBtnBg : '#262626',
            color: available ? cardBtnText : '#737373',
          }}
        >
          {available ? '+ Agregar' : 'No disponible'}
        </button>
      </div>
    </article>
  )
}