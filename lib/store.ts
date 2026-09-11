'use client';

import React, { useState, useCallback } from 'react';
import { CartItem } from './utils-pos';
import { toast } from 'sonner';

export interface UIState {
  sidebarOpen: boolean;
}

export interface CartState {
  items: CartItem[];
  discountPercent: number;
}

let uiState: UIState = { sidebarOpen: true };

let cartState: CartState = {
  items: [],
  discountPercent: 0,
};

if (typeof window !== 'undefined') {
  const savedCart = localStorage.getItem('pos_cart_state');
  if (savedCart) {
    try { cartState = JSON.parse(savedCart); } catch (e) { /* ignore */ }
  }
}

const uiListeners = new Set<() => void>();
const cartListeners = new Set<() => void>();

const saveCartToStorage = (state: CartState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pos_cart_state', JSON.stringify(state));
  }
};

export function useUIStore() {
  const [, setUpdate] = useState({});
  const subscribe = useCallback((listener: () => void) => {
    uiListeners.add(listener);
    return () => { uiListeners.delete(listener); };
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribe(() => setUpdate({}));
    return unsubscribe;
  }, [subscribe]);

  return {
    ...uiState,
    setSidebarOpen: (open: boolean) => {
      uiState.sidebarOpen = open;
      uiListeners.forEach(l => l());
    },
  };
}

export function useCartStore() {
  const [, setUpdate] = useState({});
  const notifyListeners = useCallback(() => {
    saveCartToStorage(cartState);
    cartListeners.forEach(l => l());
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    cartListeners.add(listener);
    return () => { cartListeners.delete(listener); };
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribe(() => setUpdate({}));
    return unsubscribe;
  }, [subscribe]);

  return {
    items: cartState.items,
    discountPercent: cartState.discountPercent,
    isLoaded: true,
    addItem: (item: CartItem) => {
      const existing = cartState.items.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity + item.quantity > (item as any).maxStock) {
          toast.warning('Not enough stock available');
          return;
        }
        existing.quantity += item.quantity;
      } else {
        cartState.items.push(item);
      }
      notifyListeners();
    },
    removeItem: (id: string) => {
      cartState.items = cartState.items.filter(i => i.id !== id);
      notifyListeners();
    },
    updateQuantity: (id: string, quantity: number) => {
      const item = cartState.items.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
        notifyListeners();
      }
    },
    clearCart: () => {
      cartState.items = [];
      cartState.discountPercent = 0;
      notifyListeners();
    },
    setDiscountPercent: (percent: number) => {
      cartState.discountPercent = percent;
      notifyListeners();
    },
    getSubtotal: () => {
      return cartState.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
  };
}