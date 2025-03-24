'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Type for navigation item with roles and authentication requirements
interface NavItem {
  href: string;
  label: string;
  roles: string[];  // Which roles can see this item
  requiresAuth: boolean; // Whether authentication is required
}

// Navigation data - account and admin links moved to user dropdown menu
const navItems: NavItem[] = [
  { href: '/', label: 'Home', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: false }, // Everyone
  { href: '/products', label: 'Products', roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], requiresAuth: false }, // Everyone
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
    <div className="flex gap-5 items-center font-medium">
      {/* Logo with link to home */}
      <Link href="/" className="mr-4 flex items-center">
        <Image 
          src="/logo.png"
          alt="Metrognome PMS"
          width={32}
          height={32}
          className="rounded-md"
        />
      </Link>
      
      {filteredNavItems.map((item) => {
        // Check if current path matches the nav item
        // Also handle nested routes - consider it active if the path starts with the item's href
        // But don't match root path (/) for other paths
        const isActive = 
          pathname === item.href || 
          (pathname.startsWith(item.href) && item.href !== '/');
          
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`py-2 relative transition-colors hover:text-primary/80 ${
              isActive 
                ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                : "text-foreground/80"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}