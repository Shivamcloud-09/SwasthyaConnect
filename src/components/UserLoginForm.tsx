
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast';

export default function UserLoginForm() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: 'Feature Coming Soon!',
            description: 'User authentication is currently under development.',
        });
    };

  return (
    <form onSubmit={handleLogin} className="pt-6">
        <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email-user">Email</Label>
                <Input id="email-user" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-user">Password</Label>
                <Input id="password-user" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
        </div>
        <Button type="submit" className="w-full mt-6">Sign in</Button>
    </form>
  )
}
