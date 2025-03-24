'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

// Type for navigation item with roles
interface NavItem {
  href: string;
  label: string;
  roles: string[];  // Which roles can see this item
}

// Navigation data
const navItems: NavItem[] = [
  { href: '/', label: 'Home', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'] }, // Everyone
  { href: '/products', label: 'Products', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'] }, // Everyone
  { href: '/user', label: 'User', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'] }, // Everyone
  { href: '/member', label: 'Member', roles: ['MEMBER', 'STAFF', 'ADMIN'] }, // Members and up
  { href: '/admin', label: 'Staff & Admin', roles: ['STAFF', 'ADMIN'] }, // Staff and admins only
];

interface MainNavProps {
  userRole?: string; // Current user's role
}

/**
 * Main navigation component that filters items based on user role
 */
export default function MainNav({ userRole = 'USER' }: MainNavProps) {
  const pathname = usePathname();
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="flex gap-5 items-center font-semibold">
      {filteredNavItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href}
          className={pathname === item.href ? "text-primary" : ""}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}