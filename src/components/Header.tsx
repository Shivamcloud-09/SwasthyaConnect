
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

// Links that will be visible with text on desktop
const mainNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/emergency', label: 'Emergency', icon: Siren },
  { href: '/about', label: 'About', icon: Info },
];

// All links for the mobile drawer
const mobileNavLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/emergency', label: 'Emergency Assistance', icon: Siren },
  { href: '/about', label: 'About', icon: Info },
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
      <div className="container mx-auto px-4 h-20">
        {/* Desktop Header */}
        <div className="hidden md:flex h-full items-center">
            {/* Left: Logo */}
            <div className="flex-1 flex justify-start">
                <Link href="/" className="flex items-center gap-2">
                    <Hospital className="w-7 h-7 text-primary" />
                    <span className="text-2xl font-extrabold tracking-tight font-headline">SwasthyaConnect</span>
                </Link>
            </div>

            {/* Center: Navigation */}
            <nav className="flex items-center gap-1">
                {mainNavLinks.map(link => (
                    <Button asChild variant="ghost" key={link.label} className={cn(
                        "text-muted-foreground hover:bg-muted hover:text-primary",
                        pathname === link.href && "text-primary bg-muted"
                    )}>
                        <Link href={link.href} className="flex items-center">
                            <link.icon className="h-4 w-4 mr-2" />
                            {link.label}
                        </Link>
                    </Button>
                ))}
            </nav>

            {/* Right: Icons */}
            <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-primary rounded-full">
                                    <Link href="#">
                                        <Phone className="h-5 w-5" />
                                        <span className="sr-only">Contact Us</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Contact Us</p></TooltipContent>
                        </Tooltip>

                        {user ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-muted hover:text-primary">
                                        <LogOut className="h-5 w-5" />
                                        <span className="sr-only">Logout</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Logout</p></TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button asChild variant="ghost" size="icon" className={cn("rounded-full", pathname.startsWith('/login') || pathname.startsWith('/admin') ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted hover:text-primary")}>
                                        <Link href="/login">
                                            <LogIn className="h-5 w-5" />
                                            <span className="sr-only">Login</span>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Login</p></TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                    <ThemeToggle />
                </div>
            </div>
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden flex h-full justify-between items-center">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Hospital className="w-7 h-7 text-primary" />
            <span className="text-xl font-extrabold tracking-tight font-headline">SwasthyaConnect</span>
          </Link>
          
          {/* Right: Mobile Menu */}
          <div className="flex items-center gap-2">
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
                  {mobileNavLinks.map(link => (
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
      </div>
    </header>
  );
}
