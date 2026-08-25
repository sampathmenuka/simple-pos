'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@/lib/api/hooks';
import { formatCurrency, formatDate } from '@/lib/utils-pos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = orders.filter(o => o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <Card className="mb-6">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-3 w-4 h-4" /><Input className="pl-10" placeholder="Search by customer name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : 
            <table className="w-full text-sm">
              <thead><tr className="text-left border-b"><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <React.Fragment key={o.id}>
                    <tr className="border-b cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                      <td className="py-3">#{o.id}</td>
                      <td>{o.customer_name || 'Walk-in'}</td>
                      <td>{o.items?.length || 0}</td>
                      <td className="font-bold">{formatCurrency(o.total_amount)}</td>
                      <td>{o.status}</td>
                      <td>{formatDate(o.created_at)}</td>
                    </tr>
                    {expandedId === o.id && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="p-4">
                          <div className="font-bold mb-2">Order Items</div>
                          <ul className="space-y-1">
                            {o.items?.map((item: any) => (
                              <li key={item.id} className="flex justify-between border-b pb-1">
                                <span>{item.quantity}x {item.product_name}</span>
                                <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          }
        </CardContent>
      </Card>
    </div>
  );
}
import React from 'react';