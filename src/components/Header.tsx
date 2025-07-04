
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hospital, LogIn, LogOut, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#', label: 'About' },
  { href: '/emergency', label: 'Emergency Assistance' },
];

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Firebase is not configured.",
      });
      return;
    }
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };

  return (
    <header className="bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Hospital className="w-7 h-7 text-primary" />
          <span className="text-2xl font-extrabold tracking-tight font-headline">SwasthyaConnect</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
           {user ? (
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          ) : (
            <Link href="/login" className={cn("transition-colors hover:text-primary", pathname.startsWith('/login') || pathname.startsWith('/admin') ? "text-primary font-semibold" : "text-muted-foreground")}>
                Login
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild><Link href="#">Contact Us</Link></Button>
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                {[...navLinks, { href: '/login', label: user ? 'Logout' : 'Login' }].map(link => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href}
                      onClick={link.label === 'Logout' ? (e) => { e.preventDefault(); handleLogout(); } : undefined}
                      className={cn(
                        "transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="absolute bottom-8 left-0 right-0 px-6">
                  <SheetClose asChild>
                    <Button asChild className="w-full"><Link href="#">Contact Us</Link></Button>
                  </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
