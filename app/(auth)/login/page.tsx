'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useLogin, useInitAuth } from '@/lib/api/hooks';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const { isLoading: isInitializing } = useInitAuth();
  const { mutate: login, isPending: isLoading } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData, {
      onSuccess: (data) => {
        localStorage.setItem('pos_user', JSON.stringify(data.user));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">SimplePOS</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input 
                type="text" placeholder="admin" required value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={isInitializing} autoComplete="username" suppressHydrationWarning 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" required placeholder="••••••••" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isInitializing} autoComplete="current-password" suppressHydrationWarning 
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={isLoading || isInitializing}>
              {isLoading || isInitializing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isInitializing ? 'Checking system...' : isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}