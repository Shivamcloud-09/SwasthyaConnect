
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hospital, LogIn, LogOut, Menu, Home, Info, Siren, Phone } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '#', label: 'About', icon: Info },
  { href: '/emergency', label: 'Emergency Assistance', icon: Siren },
  { href: '#', label: 'Contact Us', icon: Phone },
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
        
        {/* Desktop Navigation - Icon only with Tooltips */}
        <div className="hidden md:flex items-center gap-2">
          <TooltipProvider>
            {navLinks.map(link => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className={cn(
                      "rounded-full",
                      pathname === link.href ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary"
                    )}>
                    <Link href={link.href}>
                      <link.icon className="h-5 w-5" />
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{link.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {user ? (
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full">
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Logout</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                 <TooltipTrigger asChild>
                  <Button asChild variant="ghost" size="icon" className={cn("rounded-full", pathname.startsWith('/login') || pathname.startsWith('/admin') ? "bg-muted text-primary" : "text-muted-foreground hover:text-primary")}>
                    <Link href="/login">
                        <LogIn className="h-5 w-5" />
                        <span className="sr-only">Login</span>
                    </Link>
                  </Button>
                 </TooltipTrigger>
                 <TooltipContent>
                  <p>Login</p>
                 </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
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
                {navLinks.map(link => (
                  <SheetClose asChild key={link.href}>
                    <Link 
                      href={link.href}
                      className={cn(
                        "flex items-center gap-4 transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                
                <SheetClose asChild>
                   <Link 
                      href={'/login'}
                      onClick={user ? (e) => { e.preventDefault(); handleLogout(); } : undefined}
                      className={cn(
                        "flex items-center gap-4 transition-colors hover:text-primary",
                        (pathname.startsWith('/login') || pathname.startsWith('/admin')) && !user ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {user ? <LogOut className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                      <span>{user ? 'Logout' : 'Login'}</span>
                    </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
