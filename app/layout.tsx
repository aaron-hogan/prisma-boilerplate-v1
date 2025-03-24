import Navigation from "@/components/navigation";
import UserMenuWrapper from "@/components/user-menu-wrapper";
import MobileNavWrapper from "@/components/mobile-nav-wrapper";
import MobileThemeToggle from "@/components/mobile-theme-toggle";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
   ? `https://${process.env.VERCEL_URL}`
   : "http://localhost:3000";

export const metadata = {
   metadataBase: new URL(defaultUrl),
   title: "Metrognome PMS",
   description: "Product Management System",
};

const geistSans = Geist({
   display: "swap",
   subsets: ["latin"],
});

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en" className={geistSans.className} suppressHydrationWarning>
         <body className="bg-background text-foreground">
            <ThemeProvider
               attribute="class"
               defaultTheme="system"
               enableSystem
               disableTransitionOnChange
            >
               <div className="flex min-h-screen">
                  {/* Left sidebar navigation - hidden on mobile, visible on medium screens and up */}
                  <aside className="hidden md:flex w-64 border-r border-r-foreground/10 p-4 shrink-0 flex-col h-screen sticky top-0">
                     {/* App title */}
                     <div className="text-xl font-bold mb-6">Metrognome PMS</div>
                     
                     {/* Main navigation */}
                     <div className="flex-1 overflow-auto">
                        <Navigation />
                     </div>
                     
                     {/* Bottom sidebar section with user menu and footer */}
                     <div className="mt-4 flex flex-col gap-4">
                        {/* User account menu */}
                        <div className="border-t border-t-foreground/10 pt-4">
                           <UserMenuWrapper />
                        </div>
                        
                        {/* Footer */}
                        <div className="text-center text-xs text-muted-foreground">
                           <p>© {new Date().getFullYear()} Metrognome PMS</p>
                        </div>
                     </div>
                  </aside>
                  
                  {/* Mobile header - visible on small screens, hidden on medium screens and up */}
                  <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b border-b-foreground/10 p-4">
                     <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">Metrognome PMS</div>
                        <MobileThemeToggle />
                     </div>
                  </div>
                  
                  <div className="flex flex-col flex-1">
                     {/* Main content area */}
                     <main className="flex-1 p-6 pt-16 pb-20 md:pt-6 md:pb-6 overflow-auto">
                        {children}
                     </main>
                     
                     {/* Mobile navigation - visible at bottom on small screens */}
                     <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-t-foreground/10 p-2">
                        <MobileNavWrapper />
                     </div>
                  </div>
               </div>
            </ThemeProvider>
         </body>
      </html>
   );
}
