import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Simplified types
export interface Category {
  id: string;
  name: string;
  created_at: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  category_id: string;
  description: string | null;
  active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  active: boolean;
}

export interface Order {
  id: number;
  customer_id?: number | null;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// ============ CATEGORIES ============
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return categories.map(c => ({
    id: c.id,
    name: c.name,
    created_at: c.createdAt.toISOString(),
    active: c.active
  }));
}

export async function createCategory(name: string): Promise<Category> {
  const c = await prisma.category.create({ data: { name: name.trim() } });
  return {
    id: c.id,
    name: c.name,
    created_at: c.createdAt.toISOString(),
    active: c.active
  };
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const c = await prisma.category.update({ where: { id }, data: { name: name.trim() } });
  return {
    id: c.id,
    name: c.name,
    created_at: c.createdAt.toISOString(),
    active: c.active
  };
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<void> {
  await prisma.category.update({ where: { id }, data: { active } });
}

// ============ PRODUCTS ============
export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });
  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category_id: p.categoryId,
    category: p.category.name,
    active: p.active
  }));
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: 'asc' }
  });
  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category_id: p.categoryId,
    category: p.category.name,
    active: p.active
  }));
}

export async function createProduct(input: { name: string; description?: string; price: number; stock: number; categoryId: string }): Promise<Product> {
  const p = await prisma.product.create({
    data: input,
    include: { category: true }
  });
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category_id: p.categoryId,
    category: p.category.name,
    active: p.active
  };
}

export async function updateProduct(id: string, input: { name?: string; description?: string | null; price?: number; stock?: number; categoryId?: string; active?: boolean }): Promise<Product> {
  const p = await prisma.product.update({
    where: { id },
    data: input,
    include: { category: true }
  });
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category_id: p.categoryId,
    category: p.category.name,
    active: p.active
  };
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

export async function toggleProductActive(id: string, active: boolean): Promise<void> {
  await prisma.product.update({ where: { id }, data: { active } });
}

// ============ CUSTOMERS ============
export async function getCustomers(): Promise<Customer[]> {
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  return customers.map(c => ({
    ...c,
    created_at: c.createdAt.toISOString()
  }));
}

export async function getActiveCustomers(): Promise<Customer[]> {
  const customers = await prisma.customer.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });
  return customers.map(c => ({
    ...c,
    created_at: c.createdAt.toISOString()
  }));
}

export async function createCustomer(input: { name: string; email?: string; phone?: string }): Promise<Customer> {
  const c = await prisma.customer.create({ data: input });
  return { ...c, created_at: c.createdAt.toISOString() };
}

export async function updateCustomer(id: number, input: { name?: string; email?: string; phone?: string; active?: boolean }): Promise<Customer> {
  const c = await prisma.customer.update({ where: { id }, data: input });
  return { ...c, created_at: c.createdAt.toISOString() };
}

export async function deleteCustomer(id: number): Promise<void> {
  await prisma.customer.delete({ where: { id } });
}

export async function toggleCustomerActive(id: number, active: boolean): Promise<void> {
  await prisma.customer.update({ where: { id }, data: { active } });
}

// ============ ORDERS ============
export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      customer: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return orders.map(o => ({
    id: o.id,
    customer_id: o.customerId,
    customer_name: o.customer?.name,
    total_amount: o.total,
    discount_amount: o.discount,
    status: o.status,
    created_at: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      id: i.id,
      product_id: i.productId,
      product_name: i.product.name,
      quantity: i.quantity,
      unit_price: i.unitPrice
    }))
  }));
}

export async function createOrder(input: {
  customerId?: number;
  items: { productId: string; quantity: number; unitPrice: number }[];
  discount: number;
}): Promise<Order> {
  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    for (const item of input.items) {
      subtotal += item.quantity * item.unitPrice;
      
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    
    const total = subtotal - input.discount;
    
    const order = await tx.order.create({
      data: {
        customerId: input.customerId,
        subtotal,
        discount: input.discount,
        total,
        items: {
          create: input.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        items: { include: { product: true } },
        customer: true
      }
    });

    return {
      id: order.id,
      customer_id: order.customerId,
      customer_name: order.customer?.name,
      total_amount: order.total,
      discount_amount: order.discount,
      status: order.status,
      created_at: order.createdAt.toISOString(),
      items: order.items.map(i => ({
        id: i.id,
        product_id: i.productId,
        product_name: i.product.name,
        quantity: i.quantity,
        unit_price: i.unitPrice
      }))
    };
  });
}

// ============ AUTH ============
export async function initAuth(): Promise<void> {
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        username: 'admin',
        passwordHash
      }
    });
  }
}

export async function login(username: string, password: string): Promise<{ id: number; name: string; username: string }> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('Invalid credentials');
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');
  
  return { id: user.id, name: user.name, username: user.username };
}

export async function logout(): Promise<void> {
  // No-op for now
}

// ============ DASHBOARD ============
export async function getDashboardStats() {
  const [totalOrders, products, orders, lowStockCount] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.findMany({ select: { total: true } }),
    prisma.product.count({ where: { stock: { lt: 10 } } })
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    lowStockCount,
    totalProducts: products
  };
}