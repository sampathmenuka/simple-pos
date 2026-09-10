'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleCategoryActive } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, X } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: toggleActive } = useToggleCategoryActive();

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const submitForm = () => {
    if (editingId) {
      updateCategory({ id: editingId, name: formName }, { onSuccess: () => setShowForm(false) });
    } else {
      createCategory(formName, { onSuccess: () => setShowForm(false) });
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => { setEditingId(null); setFormName(''); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row justify-between"><CardTitle>{editingId ? 'Edit' : 'Add'}</CardTitle><X onClick={() => setShowForm(false)} className="cursor-pointer"/></CardHeader>
          <CardContent className="flex gap-4">
            <Input placeholder="Name" value={formName} onChange={e => setFormName(e.target.value)} />
            <Button onClick={submitForm}>Save</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? <p>Loading...</p> : 
            <table className="w-full">
              <thead><tr className="text-left border-b"><th>Name</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-b">
                    <td className="py-2">{c.name}</td>
                    <td><Switch checked={c.active} onCheckedChange={active => toggleActive({ id: c.id, active })} /></td>
                    <td className="py-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingId(c.id); setFormName(c.name); setShowForm(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id)}>Delete</Button>
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