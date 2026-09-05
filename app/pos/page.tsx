'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useActiveProducts, useCategories, useCreateOrder, useActiveCustomers, useOrders } from '@/lib/api/hooks';
import { formatCurrency, calculateTotal, formatDate } from '@/lib/utils-pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  Apple,
  Milk,
  Wheat,
  Beef,
  CupSoda,
  Cookie,
  IceCream,
  ShoppingBag,
  User,
  RotateCcw,
  CheckCircle2,
  Percent,
  ChevronRight,
  X,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

// Helper to assign thematic icons & gradients for US Supermarket Departments
function getCategoryVisual(categoryName: string) {
  const name = (categoryName || '').toLowerCase();
  
  // Produce / Fruits / Vegetables
  if (name.includes('produce') || name.includes('fruit') || name.includes('vegetable')) {
    return {
      icon: Apple,
      bgGradient: 'from-emerald-500/15 via-green-500/10 to-transparent',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
    };
  }
  // Dairy & Eggs
  if (name.includes('dairy') || name.includes('egg') || name.includes('milk') || name.includes('cheese')) {
    return {
      icon: Milk,
      bgGradient: 'from-sky-500/15 via-blue-500/10 to-transparent',
      accentColor: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300',
    };
  }
  // Bakery & Bread
  if (name.includes('bakery') || name.includes('bread') || name.includes('pastry')) {
    return {
      icon: Wheat,
      bgGradient: 'from-amber-500/15 via-orange-500/10 to-transparent',
      accentColor: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
    };
  }
  // Meat & Seafood
  if (name.includes('meat') || name.includes('seafood') || name.includes('beef') || name.includes('chicken') || name.includes('fish')) {
    return {
      icon: Beef,
      bgGradient: 'from-rose-500/15 via-red-500/10 to-transparent',
      accentColor: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
    };
  }
  // Beverages / Drinks
  if (name.includes('beverage') || name.includes('drink') || name.includes('juice') || name.includes('soda') || name.includes('coffee')) {
    return {
      icon: CupSoda,
      bgGradient: 'from-cyan-500/15 via-teal-500/10 to-transparent',
      accentColor: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300',
    };
  }
  // Snacks & Pantry
  if (name.includes('snack') || name.includes('pantry') || name.includes('cookie') || name.includes('chip')) {
    return {
      icon: Cookie,
      bgGradient: 'from-purple-500/15 via-violet-500/10 to-transparent',
      accentColor: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
    };
  }
  // Frozen Foods
  if (name.includes('frozen') || name.includes('ice cream')) {
    return {
      icon: IceCream,
      bgGradient: 'from-indigo-500/15 via-blue-500/10 to-transparent',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
    };
  }

  // Fallback
  return {
    icon: Package,
    bgGradient: 'from-slate-500/15 via-zinc-500/10 to-transparent',
    accentColor: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
  };
}

export default function POSPage() {
  const { data: products = [], isLoading: productsLoading } = useActiveProducts();
  const { data: categories = [] } = useCategories();
  const { data: customers = [] } = useActiveCustomers();
  const { data: recentOrders = [] } = useOrders();
  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [orderType, setOrderType] = useState<'In-Store' | 'Curbside' | 'Delivery'>('In-Store');

  const {
    items: cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    discountPercent,
    setDiscountPercent,
    getSubtotal,
  } = useCartStore();

  // Quick lookup for items currently in cart
  const cartItemMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((i) => map.set(i.id, i.quantity));
    return map;
  }, [cart]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const subtotal = getSubtotal();
  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const total = calculateTotal(subtotal, discount);
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error('Your cart is empty');

    const customerIdNum = selectedCustomerId === 'walk-in' ? null : Number(selectedCustomerId);

    const payload = {
      customerId: customerIdNum,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      discount: discount,
    };

    createOrder(payload, {
      onSuccess: () => {
        toast.success('Order completed successfully!', {
          description: `Total: ${formatCurrency(total)}`,
        });
        clearCart();
        setDiscountPercent(0);
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50/70 dark:bg-zinc-950 p-4 lg:p-6">
      <div className="max-w-[1680px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ============================================================
            LEFT SECTION: RECENT ORDERS, CATEGORIES, SEARCH, PRODUCT GRID
            ============================================================ */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* 1. RECENT ORDERS CAROUSEL */}
          {recentOrders.length > 0 && (
            <div className="bg-card border border-border/80 shadow-xs rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">Recent Supermarket Orders</h2>
                  <Badge variant="secondary" className="rounded-full px-2.5 text-xs font-semibold">
                    {recentOrders.length}
                  </Badge>
                </div>
                <Link
                  href="/orders"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  View All Orders <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex gap-3.5 overflow-x-auto pb-1 scrollbar-thin">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="min-w-[210px] sm:min-w-[230px] bg-slate-100/70 dark:bg-zinc-900/80 border border-border/70 rounded-xl p-3.5 flex flex-col justify-between hover:border-blue-400/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        #{String(order.id).padStart(5, '0')}
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-none text-[11px] font-semibold py-0.5 px-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                      </Badge>
                    </div>

                    <div className="my-2">
                      <div className="text-sm font-semibold truncate">
                        {order.customer_name || 'Walk-in Shopper'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.created_at).split(',')[1] || formatDate(order.created_at)}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Total:</span>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CATEGORY PILLS BAR */}
          <div className="bg-card border border-border/80 shadow-xs rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold tracking-tight">Supermarket Departments</h2>
              <span className="text-xs text-muted-foreground font-medium">
                {products.length} grocery items available
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {/* All Items Pill */}
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                    : 'bg-background hover:bg-slate-100 dark:hover:bg-zinc-900 border-border text-foreground'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedCategory === 'All' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">All Items</div>
                  <div className={`text-[11px] font-normal ${selectedCategory === 'All' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                    {categoryCounts['All'] || 0} items
                  </div>
                </div>
              </button>

              {/* Dynamic Supermarket Category Pills */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const visual = getCategoryVisual(cat.name);
                const IconComponent = visual.icon;
                const count = categoryCounts[cat.name] || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25'
                        : 'bg-background hover:bg-slate-100 dark:hover:bg-zinc-900 border-border text-foreground'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 ' + visual.accentColor
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="leading-tight">{cat.name}</div>
                      <div className={`text-[11px] font-normal ${isSelected ? 'text-blue-100' : 'text-muted-foreground'}`}>
                        {count} items
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SEARCH & QUICK FILTER BAR */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search groceries, brand, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border/80 rounded-xl h-11 text-sm shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {selectedCategory !== 'All' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory('All')}
                  className="rounded-xl text-xs gap-1.5 h-10 border-border/80"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> All Departments
                </Button>
              )}
              <span className="text-xs font-semibold text-muted-foreground px-2">
                Showing {filteredProducts.length} items
              </span>
            </div>
          </div>

          {/* 4. PRODUCT CARDS GRID */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-56 bg-card border border-border/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-card border border-border/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">No grocery items found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Try searching for another product name or selecting a different department.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4 rounded-xl text-xs"
              >
                Reset Department Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const visual = getCategoryVisual(product.category);
                const IconComponent = visual.icon;
                const qtyInCart = cartItemMap.get(product.id) || 0;
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className={`bg-card border border-border/80 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col justify-between group ${
                      isOutOfStock ? 'opacity-55 cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Top Illustration/Gradient Area */}
                    <div
                      className={`relative h-28 bg-gradient-to-br ${visual.bgGradient} p-3 flex flex-col justify-between`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`${visual.badgeBg} border-none font-medium text-[10px] px-2 py-0.5 rounded-full`}
                        >
                          {product.category}
                        </Badge>

                        {product.stock > 0 && product.stock <= 10 && (
                          <Badge className="bg-amber-500 text-white border-none text-[10px] px-2 py-0.5 font-bold">
                            Stock: {product.stock}
                          </Badge>
                        )}
                        {isOutOfStock && (
                          <Badge className="bg-rose-500 text-white border-none text-[10px] px-2 py-0.5 font-bold">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-zinc-900/90 shadow-xs flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className={`w-6 h-6 ${visual.accentColor}`} />
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                      <div>
                        <h4 className="font-bold text-sm tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Price</div>
                          <div className="text-base font-extrabold text-foreground">
                            {formatCurrency(product.price)}
                          </div>
                        </div>

                        {/* Interactive Quantity Control Directly on Card */}
                        {qtyInCart > 0 ? (
                          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 rounded-xl p-0.5 border border-border">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, qtyInCart - 1);
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              disabled={qtyInCart >= product.stock}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(product.id, qtyInCart + 1);
                              }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 active:scale-90 transition-all disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() =>
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                category: product.category,
                              })
                            }
                            className="rounded-xl h-8 px-3 text-xs font-semibold gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================
            RIGHT SECTION: ORDER & CART SIDEBAR
            ============================================================ */}
        <div className="xl:col-span-4">
          <div className="bg-card border border-border/80 shadow-xs rounded-2xl p-5 flex flex-col sticky top-20 max-h-[calc(100vh-100px)]">
            
            {/* Header: Order # + Date/Time */}
            <div className="flex items-start justify-between pb-3.5 border-b border-border/70">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg tracking-tight">Current Cart</h3>
                  <Badge variant="outline" className="text-xs font-semibold rounded-md">
                    #{recentOrders.length + 1}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(new Date())}
                </div>
              </div>

              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl h-8 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Fulfillment Type Toggle Pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl my-3.5">
              {(['In-Store', 'Curbside', 'Delivery'] as const).map((type) => {
                const isActive = orderType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Customer Selector */}
            <div className="flex items-center gap-2 mb-3.5">
              <div className="relative flex-1">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-100/70 dark:bg-zinc-900 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden appearance-none cursor-pointer"
                >
                  <option value="walk-in">👤 Walk-in Shopper</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </div>
              </div>

              <Link href="/customers">
                <Button variant="outline" size="sm" className="rounded-xl h-9 px-2.5 text-xs font-semibold" title="Manage Customers">
                  <User className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[320px] scrollbar-thin my-1">
              {cart.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground/60" />
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">Your shopping cart is empty</div>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-[200px]">
                    Click any grocery item from the supermarket shelves on the left to add it here.
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const visual = getCategoryVisual(item.category);
                  const IconComp = visual.icon;
                  const itemTotal = item.price * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 dark:bg-zinc-900/60 border border-border/70 rounded-xl flex items-center gap-2.5 hover:border-border transition-all"
                    >
                      {/* Icon Avatar */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${visual.badgeBg}`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center bg-background border border-border/80 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-xs font-bold text-right min-w-[50px]">
                        {formatCurrency(itemTotal)}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Payment Summary */}
            <div className="pt-3.5 border-t border-border/70 space-y-2 mt-auto">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>Subtotal ({totalCartCount} items):</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Section */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> Member Discount (%):
                </span>
                <div className="flex items-center gap-1.5">
                  {[5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(discountPercent === pct ? 0 : pct)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                        discountPercent === pct
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-zinc-800 border-border text-muted-foreground'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    placeholder="0"
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="w-14 h-7 text-xs text-right font-semibold rounded-lg"
                  />
                </div>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Savings Applied:</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Due
                  </div>
                  <div className="text-[11px] text-muted-foreground">Taxes included</div>
                </div>
                <div className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                  {formatCurrency(total)}
                </div>
              </div>

              {/* Primary Action Button */}
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full mt-2 rounded-xl h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>Processing Checkout...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Charge {formatCurrency(total)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
