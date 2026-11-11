import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const currentCart = get().cart
        const existingItem = currentCart.find((item) => item.id === product.id)

        if (existingItem) {
          set({
            cart: currentCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({
            cart: [...currentCart, { ...product, quantity: 1 }],
          })
        }
      },

      removeFromCart: (productId) => {
        const currentCart = get().cart
        const existingItem = currentCart.find((item) => item.id === productId)

        if (existingItem && existingItem.quantity > 1) {
          set({
            cart: currentCart.map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          })
        } else {
          set({
            cart: currentCart.filter((item) => item.id !== productId),
          })
        }
      },

      deleteFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.id !== productId),
        })
      },

      clearCart: () => set({ cart: [] }),

      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cartamenu-cart-storage',
    }
  )
)