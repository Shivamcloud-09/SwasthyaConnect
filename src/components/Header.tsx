
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Hospital, Home, Siren, LogIn, Ambulance, ShieldAlert, Flame, LifeBuoy, HeartHandshake, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Header = () => {
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
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Hospital className="w-6 h-6" />
            <span>SwasthyaConnect</span>
          </Link>
          <TooltipProvider>
            <nav className="flex items-center gap-1 md:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant={pathname === '/' ? 'secondary' : 'ghost'} size="icon" aria-label="Home">
                    <Link href="/">
                      <Home className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <DropdownMenu>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Emergency Contacts">
                        <Siren className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Emergency Numbers</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="tel:102" className="flex items-center gap-2 w-full cursor-pointer">
                        <Ambulance className="h-4 w-4" />
                        <span>Ambulance (102)</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="tel:112" className="flex items-center gap-2 w-full cursor-pointer">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Police (112)</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="tel:101" className="flex items-center gap-2 w-full cursor-pointer">
                        <Flame className="h-4 w-4" />
                        <span>Fire (101)</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="tel:108" className="flex items-center gap-2 w-full cursor-pointer">
                        <LifeBuoy className="h-4 w-4" />
                        <span>Disaster Mgmt (108)</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="tel:1091" className="flex items-center gap-2 w-full cursor-pointer">
                        <HeartHandshake className="h-4 w-4" />
                        <span>Women Helpline (1091)</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TooltipContent>
                  <p>Emergency Assistance</p>
                </TooltipContent>
              </Tooltip>
              
              {user ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Logout" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
              ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant={pathname.startsWith('/login') || pathname.startsWith('/admin') ? 'secondary' : 'ghost'} size="icon" aria-label="Login">
                        <Link href="/login">
                          <LogIn className="h-5 w-5" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Login</p>
                    </TooltipContent>
                  </Tooltip>
              )}
              
              <ThemeToggle />
            </nav>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
};

export default Header;
