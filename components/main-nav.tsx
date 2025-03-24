'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

// Type for navigation item with roles and authentication requirements
interface NavItem {
  href: string;
  label: string;
  roles: string[];  // Which roles can see this item
  requiresAuth: boolean; // Whether authentication is required
}

// Navigation data
const navItems: NavItem[] = [
  { href: '/', label: 'Home', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: false }, // Everyone
  { href: '/products', label: 'Products', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: false }, // Everyone
  { href: '/purchases', label: 'Purchases', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: true }, // Auth users only
  { href: '/user', label: 'Profile', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: true }, // Auth users only
  { href: '/member', label: 'Member Area', roles: ['MEMBER', 'STAFF', 'ADMIN'], requiresAuth: true }, // Members only area
  { href: '/admin', label: 'Admin', roles: ['STAFF', 'ADMIN'], requiresAuth: true }, // Staff and admins only
];

interface MainNavProps {
  userRole?: string; // Current user's role
  isAuthenticated?: boolean; // Whether the user is authenticated
}

/**
 * Main navigation component that filters items based on user role and auth status
 */
export default function MainNav({ userRole = 'USER', isAuthenticated = false }: MainNavProps) {
  const pathname = usePathname();
  
  // Filter nav items based on user role and auth status
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole) && 
    (!item.requiresAuth || (item.requiresAuth && isAuthenticated))
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