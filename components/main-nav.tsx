'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, Package, ShoppingCart } from "lucide-react";

// Type for navigation item with roles and authentication requirements
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];  // Which roles can see this item
  requiresAuth: boolean; // Whether authentication is required
}

// Navigation data with icons - account and admin links moved to user dropdown menu
const navItems: NavItem[] = [
  { 
    href: '/', 
    label: 'Home', 
    icon: <Home size={20} />,
    roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], 
    requiresAuth: false 
  },
  { 
    href: '/products', 
    label: 'Products', 
    icon: <ShoppingBag size={20} />,
    roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], 
    requiresAuth: false 
  },
  { 
    href: '/user', 
    label: 'Dashboard', 
    icon: <User size={20} />,
    roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], 
    requiresAuth: true 
  },
  { 
    href: '/purchases', 
    label: 'Purchases', 
    icon: <ShoppingCart size={20} />,
    roles: ['USER', 'MEMBER', 'STAFF', 'ADMIN'], 
    requiresAuth: true 
  },
  { 
    href: '/admin', 
    label: 'Admin', 
    icon: <Package size={20} />,
    roles: ['ADMIN', 'STAFF'], 
    requiresAuth: true 
  },
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
    <div className="flex flex-col gap-3 font-medium w-full">
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
            className={`p-3 rounded-md transition-colors hover:bg-primary/10 flex items-center gap-3 ${
              isActive 
                ? "text-primary font-bold bg-primary/10 border-l-4 border-primary pl-2" 
                : "text-foreground/80 pl-3"
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}