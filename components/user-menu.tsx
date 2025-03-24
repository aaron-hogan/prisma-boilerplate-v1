'use client';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/theme-switcher";
import { signOutAction } from "@/app/actions";
import { useRouter, usePathname } from "next/navigation";
import { User, LogOut, Shield, ChevronDown } from "lucide-react";

interface UserMenuProps {
  userEmail?: string | null;
  userRole?: string | null;
  isAuthenticated?: boolean;
}

export default function UserMenu({ userEmail, userRole, isAuthenticated }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminOrStaff = ['ADMIN', 'STAFF'].includes(userRole || '');
  
  // If user is not authenticated, show the theme switcher and auth buttons
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/sign-in">Sign in</a>
          </Button>
          <Button asChild size="sm">
            <a href="/sign-up">Sign up</a>
          </Button>
        </div>
      </div>
    );
  }
  
  // Check if current path is in user or admin section
  const isUserOrAdminSection = pathname.startsWith('/user') || pathname.startsWith('/admin');
  
  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      
      <DropdownMenu>
        <DropdownMenuTrigger 
          className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-muted focus:outline-none ${
            isUserOrAdminSection ? 'bg-muted/50 font-medium' : ''
          }`}
        >
          <User className="h-4 w-4" />
          <span className="hidden md:inline max-w-[100px] truncate">
            {userEmail || 'Account'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium truncate">{userEmail}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => router.push('/user')}
            className={pathname.startsWith('/user') ? 'bg-muted font-medium' : ''}
          >
            <User className="h-4 w-4 mr-2" />
            My Account
          </DropdownMenuItem>
          
          {isAdminOrStaff && (
            <DropdownMenuItem 
              onClick={() => router.push('/admin')}
              className={pathname.startsWith('/admin') ? 'bg-muted font-medium' : ''}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => signOutAction()}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}