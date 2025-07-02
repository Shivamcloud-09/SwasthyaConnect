
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hospital, Home, Siren, LogIn, Ambulance, ShieldAlert, Flame, LifeBuoy, HeartHandshake } from 'lucide-react';
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

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Hospital className="w-6 h-6" />
            <span>SwasthyaConnect</span>
          </Link>
          <nav className="flex items-center gap-1 md:gap-2">
            <Link href="/" passHref>
              <Button variant={pathname === '/' ? 'secondary' : 'ghost'} size="icon" aria-label="Home">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Emergency Contacts">
                  <Siren className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
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

            <Link href="/login" passHref>
              <Button variant={pathname.startsWith('/login') || pathname.startsWith('/admin') ? 'secondary' : 'ghost'} size="icon" aria-label="Login">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
            
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
