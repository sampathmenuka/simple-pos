'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useToggleCustomerActive } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const { mutate: createCustomer } = useCreateCustomer();
  const { mutate: updateCustomer } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();
  const { mutate: toggleActive } = useToggleCustomerActive();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const submitForm = () => {
    if (editingId) updateCustomer({ id: editingId, ...formData }, { onSuccess: () => setShowForm(false) });
    else createCustomer(formData, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => { setEditingId(null); setFormData({name:'', email:'', phone:''}); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> Add Customer</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between"><CardTitle>{editingId ? 'Edit' : 'Add'}</CardTitle><X onClick={() => setShowForm(false)} className="cursor-pointer"/></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Button onClick={submitForm}>Save</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : 
            <table className="w-full">
              <thead><tr className="text-left border-b"><th>Name</th><th>Email</th><th>Phone</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td><Switch checked={c.active} onCheckedChange={active => toggleActive({ id: c.id, active })} /></td>
                    <td className="flex gap-2 py-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingId(c.id); setFormData({name: c.name, email: c.email, phone: c.phone}); setShowForm(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteCustomer(c.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </CardContent>
      </Card>
    </div>
  );
}