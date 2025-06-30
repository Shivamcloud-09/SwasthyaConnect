
import Link from 'next/link';
import { Hospital } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <Hospital className="w-6 h-6" />
            <span>SwasthyaConnect</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Hospital Login
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
