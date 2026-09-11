'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductActive, useCategories } from '@/lib/api/hooks';
import { formatCurrency } from '@/lib/utils-pos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { mutate: createProduct } = useCreateProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: toggleActive } = useToggleProductActive();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', categoryId: '', description: ''
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const submitForm = () => {
    const payload = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: formData.categoryId,
      description: formData.description
    };

    if (editingId) {
      updateProduct({ id: editingId, ...payload }, { onSuccess: () => setShowForm(false) });
    } else {
      createProduct(payload, { onSuccess: () => setShowForm(false) });
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setFormData({ name: p.name, price: p.price.toString(), stock: p.stock.toString(), categoryId: p.category_id, description: p.description || '' });
    setShowForm(true);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', price: '', stock: '', categoryId: '', description: '' }); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between"><CardTitle>{editingId ? 'Edit Product' : 'Add Product'}</CardTitle><X className="cursor-pointer" onClick={() => setShowForm(false)}/></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <Input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              <select className="border rounded p-2" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <Button onClick={submitForm}>Save</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><Input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading...</p> : 
            <table className="w-full">
              <thead><tr className="text-left border-b"><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.stock}</td>
                    <td><Switch checked={p.active} onCheckedChange={c => toggleActive({ id: p.id, active: c })} /></td>
                    <td className="flex gap-2 py-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProduct(p.id)}>Delete</Button>
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