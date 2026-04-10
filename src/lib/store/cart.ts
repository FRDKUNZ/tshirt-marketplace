import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, DesignConfig } from '@/lib/validations'
import { getUnitPrice } from '@/lib/pricing'

export interface CustomPrintAttachment {
  fileName: string
  fileSize: number
  fileType: string
  preview: string // base64 data URL
  description: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'> & { customPrintAttachments?: CustomPrintAttachment[] }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  getItemUnitPrice: (id: string) => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          // Generate unique ID based on design and size
          const itemId = `${item.design.tshirt_color}-${item.size}-${Date.now()}`
          const newItem: CartItem = { ...item, id: itemId }
          return { items: [...state.items, newItem] }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items, getItemCount } = get()
        const totalQty = getItemCount()
        return items.reduce((total, item) => {
          const sides = item.design.front_design && item.design.back_design ? 2 : 1
          const { price } = getUnitPrice(totalQty, sides as 1 | 2)
          return total + price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      getItemUnitPrice: (id) => {
        const { items, getItemCount } = get()
        const item = items.find((i) => i.id === id)
        if (!item) return 0
        const totalQty = getItemCount()
        const sides = item.design.front_design && item.design.back_design ? 2 : 1
        const { price } = getUnitPrice(totalQty, sides as 1 | 2)
        return price
      },
    }),
    {
      name: 'tshirt-cart',
    }
  )
)
