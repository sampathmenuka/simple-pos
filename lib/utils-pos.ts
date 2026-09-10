// Currency formatter (US Dollar)
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

export function calculateTotal(subtotal: number, discount: number): number {
  return Math.round((subtotal - discount) * 100) / 100;
}

export function formatIntegerId(id: number | string): string {
  return String(id).padStart(6, '0');
}

export function formatDate(date: Date | string | undefined | null): string {
  if (!date) {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: true,
  });
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface OrderItem {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  customer_id?: number;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  category_id?: string;
  description?: string | null;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  active: boolean;
}
