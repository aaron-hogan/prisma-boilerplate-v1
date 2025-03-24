'use client';

import { Button } from "@/components/ui/button";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function MobileThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // useEffect only runs on the client, so now we can safely show UI that depends on theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Get theme icon based on current theme
  const ThemeIcon = () => {
    if (theme === "light") {
      return <Sun size={20} />;
    } else if (theme === "dark") {
      return <Moon size={20} />;
    } else {
      return <Laptop size={20} />;
    }
  };
  
  // Cycle through themes when button is clicked
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={cycleTheme}
      className="rounded-full h-9 w-9"
    >
      <ThemeIcon />
    </Button>
  );
}