import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  storeId: string | null;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: (isWholesale: boolean) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,

  addItem: (product, quantity) => {
    const { items, storeId } = get();

    // 다른 가게 상품 담으려 할 때 초기화
    if (storeId && storeId !== product.store_id) {
      set({ items: [{ product, quantity }], storeId: product.store_id });
      return;
    }

    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        ),
      });
    } else {
      set({ items: [...items, { product, quantity }], storeId: product.store_id });
    }
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => i.product.id !== productId);
    set({ items, storeId: items.length === 0 ? null : get().storeId });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [], storeId: null }),

  getTotalPrice: (isWholesale) => {
    return get().items.reduce((sum, item) => {
      const price = isWholesale ? item.product.wholesale_price : item.product.retail_price;
      return sum + price * item.quantity;
    }, 0);
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
