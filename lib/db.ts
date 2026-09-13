import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Category, Product, Customer, Order, OrderItem } from '@/lib/utils-pos';
export type { Category, Product, Customer, Order, OrderItem };

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
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
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new OrderValidationError('At least one product is required');
    }

    let subtotal = 0;
    const orderItems: { productId: string; quantity: number; unitPrice: number; total: number }[] = [];
    for (const item of input.items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new OrderValidationError('Product quantities must be positive whole numbers');
      }

      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.active) {
        throw new OrderValidationError('One or more products are unavailable');
      }

      const updated = await tx.product.updateMany({
        where: { id: product.id, active: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new OrderValidationError(`${product.name} does not have enough stock`);
      }

      const total = item.quantity * product.price;
      subtotal += total;
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price, total });
    }

    const discount = Number(input.discount ?? 0);
    if (!Number.isFinite(discount) || discount < 0 || discount > subtotal) {
      throw new OrderValidationError('Discount must be between zero and the subtotal');
    }
    const total = subtotal - discount;
    
    const order = await tx.order.create({
      data: {
        customerId: input.customerId,
        subtotal,
        discount,
        total,
        items: {
          create: orderItems
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