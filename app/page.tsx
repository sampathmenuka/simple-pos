'use client';

import Link from 'next/link';
import { useProducts, useOrders } from '@/lib/api/hooks';
import { formatCurrency, formatDate, formatIntegerId } from '@/lib/utils-pos';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, ShoppingCart, Package, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  const isLoading = productsLoading || ordersLoading;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockProducts = products.filter((p) => p.stock < 5).length;

  const chartData = orders.slice(-7).map((order) => ({
    date: formatDate(order.created_at).split(',')[0],
    revenue: order.total_amount,
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to SimplePOS</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Orders</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{totalOrders}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Avg Order Value</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold">{formatCurrency(avgOrderValue)}</div></CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Low Stock Items</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-bold text-orange-600">{lowStockProducts}</div></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="h-80 flex items-center justify-center">No orders yet</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/pos" className="block"><Button className="w-full">New Sale</Button></Link>
                  <Link href="/products" className="block"><Button variant="outline" className="w-full">Manage Products</Button></Link>
                  <Link href="/customers" className="block"><Button variant="outline" className="w-full">Manage Customers</Button></Link>
                  <Link href="/orders" className="block"><Button variant="outline" className="w-full">Order History</Button></Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
