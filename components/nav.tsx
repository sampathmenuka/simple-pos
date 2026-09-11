"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { useTheme } from "next-themes";
import {
  Menu,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  History,
  Sun,
  Moon,
  Tags,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/lib/api/hooks";

export function Navigation() {
  const pathname = usePathname() || "";
  const [mounted, setMounted] = useState(false);
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { theme, setTheme } = useTheme();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (!isConfirmed) return;
    localStorage.removeItem("pos_user");
    logout();
  };

  if (!mounted) return null;
  if (pathname === "/login" || pathname === "/(auth)/login") return null;

  const navItems = [
    { href: "/pos", label: "POS", icon: ShoppingCart },
    { href: "/orders", label: "Orders", icon: History },
    { href: "/products", label: "Products", icon: Package },
    { href: "/categories", label: "Categories", icon: Tags },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/", label: "Dashboard", icon: BarChart3 },
  ];

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border/70 shadow-2xs sticky top-0 z-40">
      <div className="max-w-420 mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden rounded-xl h-9 w-9 p-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link href="/pos" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-foreground">Simple</span>
              <span className="text-xs font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                POS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Nav Pills */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-900/90 p-1 rounded-xl border border-border/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  type="button"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Controls & Profile */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
            className="rounded-xl h-9 w-9 p-0 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/70 dark:bg-zinc-900 border border-border/60">
            <div className="w-6 h-6 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
              A
            </div>
            <span className="text-xs font-semibold text-foreground">Admin</span>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Log Out"
            className="rounded-xl h-9 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {sidebarOpen && (
        <div className="lg:hidden px-4 py-3 space-y-1.5 border-t border-border bg-card">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  type="button"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
