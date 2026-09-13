'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useProducts, useOrders, useCategories } from '@/lib/api/hooks';
import { formatCurrency, formatDate } from '@/lib/utils-pos';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  History,
  Store,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function Dashboard() {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: categories = [] } = useCategories();

  const isLoading = productsLoading || ordersLoading;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const lowStockProducts = products.filter((p) => p.stock < 10);
  const activeProductsCount = products.filter((p) => p.active).length;

  // Chart data formatting: last 7 orders with cumulative or timeline view
  const chartData = useMemo(() => {
    if (orders.length === 0) return [];
    return orders
      .slice(-7)
      .map((order) => ({
        date: formatDate(order.created_at).split(',')[0],
        revenue: order.total_amount,
        customer: order.customer_name || 'Walk-in',
      }));
  }, [orders]);

  // Department inventory breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).slice(0, 5);
  }, [products]);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/70 dark:bg-zinc-950 text-foreground transition-colors duration-200 pb-12">
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* ============================================================
            4 SOLID METRIC TILES
            ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Tile 1: Total Revenue */}
          <div className="rounded-3xl p-6 bg-card border border-border hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Gross sales to date
              </div>
            </div>
          </div>

          {/* Tile 2: Total Orders */}
          <div className="rounded-3xl p-6 bg-card border border-border hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {totalOrders}
              </div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Fulfilled receipts
              </div>
            </div>
          </div>

          {/* Tile 3: Avg Order Value */}
          <div className="rounded-3xl p-6 bg-card border border-border hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Basket Value</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {formatCurrency(avgOrderValue)}
              </div>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                Per checkout transaction
              </div>
            </div>
          </div>

          {/* Tile 4: Inventory Alerts */}
          <div className="rounded-3xl p-6 bg-card border border-border hover:border-amber-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Low Stock Alert</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                {lowStockProducts.length}
              </div>
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                {lowStockProducts.length === 0 ? 'All shelves well stocked' : 'Products need restocking'}
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================
            MAIN CONTENT SPLIT: STATIC REVENUE CHART + ACTION DOCK
            ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: REVENUE CHART (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl p-6 sm:p-7 bg-card border border-border shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-foreground tracking-tight">Revenue Trajectory</h2>
                  <Badge variant="secondary" className="font-semibold text-[11px] px-2 py-0.5">
                    Latest Sales
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visual cashflow generated from processed customer carts
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 border border-border px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                Settled in USD ($)
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-80 pt-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} opacity={0.6} />
                    <XAxis
                      dataKey="date"
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-muted-foreground"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover text-popover-foreground border border-border shadow-lg rounded-xl p-3 text-xs space-y-1">
                              <div className="text-muted-foreground font-semibold">{data.date}</div>
                              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(data.revenue)}
                              </div>
                              <div className="text-[10px] text-muted-foreground">Shopper: {data.customer}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="#3b82f6"
                      fillOpacity={0.15}
                      dot={{ r: 4, fill: '#2563eb', stroke: 'var(--card)', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: 'var(--foreground)', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                  <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                  No supermarket transactions logged yet. Complete a checkout in POS!
                </div>
              )}
            </div>

            {/* Bottom mini metric footer */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Catalog Depts</span>
                <span className="text-foreground font-bold">{categories.length} Departments</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Active SKUs</span>
                <span className="text-foreground font-bold">{activeProductsCount} Items</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Avg Settlement</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(avgOrderValue)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS & DEPT HEALTH (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Action Dock with Theme Support */}
            <div className="rounded-3xl p-6 bg-card border border-border shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">Quick Operations</h3>
                  <p className="text-[11px] text-muted-foreground">Direct navigation shortcuts</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/pos" className="block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4" />
                      <span>New Supermarket Sale</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                </Link>

                <Link href="/products" className="block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-border text-foreground font-semibold text-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span>Manage Products & Stock</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </Link>

                <Link href="/orders" className="block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-border text-foreground font-semibold text-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>View Orders Log</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </Link>

                <Link href="/customers" className="block">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-border text-foreground font-semibold text-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Customers & Members</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Department Breakdown with Theme Support */}
            <div className="rounded-3xl p-6 bg-card border border-border shadow-xs">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                <span>Top Grocery Departments</span>
                <span className="text-[11px] font-normal text-muted-foreground">{products.length} SKUs</span>
              </h4>

              <div className="space-y-3">
                {categoryBreakdown.map(([catName, count]) => {
                  const percent = Math.min(100, Math.round((count / (products.length || 1)) * 100));
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{catName}</span>
                        <span className="text-muted-foreground text-[11px]">{count} items</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
