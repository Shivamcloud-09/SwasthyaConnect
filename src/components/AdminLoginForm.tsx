
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulated authentication
        if (username === 'admin' && password === 'password') {
            localStorage.setItem('swasthya-admin-auth', 'true');
            toast({
                title: 'Login Successful',
                description: 'Redirecting to dashboard...',
            });
            router.push('/admin/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid username or password.',
            });
        }
    };

  return (
    <form onSubmit={handleLogin} className="pt-6">
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username-admin">Username</Label>
                <Input id="username-admin" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="admin" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-admin">Password</Label>
                <Input id="password-admin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="password" />
            </div>
        </div>
        <Button type="submit" className="w-full mt-6">Sign in</Button>
    </form>
  )
}
