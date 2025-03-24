'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Settings } from "lucide-react";

interface MobileNavProps {
  userRole?: string;
  isAuthenticated?: boolean;
}

export default function MobileNav({ userRole = 'USER', isAuthenticated = false }: MobileNavProps) {
  const pathname = usePathname();
  const isAdminOrStaff = ['ADMIN', 'STAFF'].includes(userRole);
  
  // Basic navigation items for mobile
  const navItems = [
    { href: '/', icon: <Home size={24} />, label: 'Home' },
    { href: '/products', icon: <ShoppingBag size={24} />, label: 'Products' },
  ];
  
  // Add user page if authenticated
  if (isAuthenticated) {
    navItems.push({ href: '/user', icon: <User size={24} />, label: 'Account' });
  }
  
  // Add admin page if admin/staff
  if (isAdminOrStaff && isAuthenticated) {
    navItems.push({ href: '/admin', icon: <Settings size={24} />, label: 'Admin' });
  }
  
  return (
    <nav className="w-full flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = 
          pathname === item.href || 
          (pathname.startsWith(item.href) && item.href !== '/');
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center p-2 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}