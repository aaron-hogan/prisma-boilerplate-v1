'use client';

import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/theme-switcher";
import { signOutAction } from "@/app/actions";
import { usePathname } from "next/navigation";
import { User, LogOut, Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserMenuProps {
  userEmail?: string | null;
  userRole?: string | null;
  isAuthenticated?: boolean;
}

export default function UserMenu({ userEmail, userRole, isAuthenticated }: UserMenuProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // useEffect only runs on the client, so now we can safely show UI that depends on theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get theme icon based on current theme
  const getThemeIcon = () => {
    if (!mounted) return null;
    return theme === "light" ? (
      <Sun size={18} />
    ) : theme === "dark" ? (
      <Moon size={18} />
    ) : (
      <Laptop size={18} />
    );
  };
  
  // Cycle through themes when button is clicked
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
  
  // If user is not authenticated, show auth buttons
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Theme toggle */}
        <Button 
          onClick={cycleTheme} 
          variant="outline" 
          className="w-full justify-start gap-2"
          size="sm"
        >
          {getThemeIcon()}
          <span>{mounted ? theme?.charAt(0).toUpperCase() + theme?.slice(1) : 'Theme'}</span>
        </Button>
        
        <Link href="/sign-in" className="w-full">
          <Button size="sm" className="w-full">Sign in</Button>
        </Link>
        
        <Link href="/sign-up" className="w-full">
          <Button size="sm" variant="outline" className="w-full">Sign up</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* User info */}
      <div className="flex items-center gap-2 py-2">
        <div className="bg-primary/10 rounded-full p-2">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-sm truncate max-w-[180px]">{userEmail}</span>
          <span className="text-xs text-muted-foreground">{userRole}</span>
        </div>
      </div>
      
      {/* Theme toggle */}
      <Button 
        onClick={cycleTheme} 
        variant="outline" 
        className="w-full justify-start gap-2"
        size="sm"
      >
        {getThemeIcon()}
        <span>{mounted ? theme?.charAt(0).toUpperCase() + theme?.slice(1) : 'Theme'}</span>
      </Button>
      
      {/* Sign out button */}
      <Button 
        onClick={() => signOutAction()} 
        variant="ghost" 
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        size="sm"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}