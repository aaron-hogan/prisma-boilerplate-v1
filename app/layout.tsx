import Navigation from "@/components/navigation";
import UserMenuWrapper from "@/components/user-menu-wrapper";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
   ? `https://${process.env.VERCEL_URL}`
   : "http://localhost:3000";

export const metadata = {
   metadataBase: new URL(defaultUrl),
   title: "Application",
   description: "Application description",
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
               <div className="flex flex-col min-h-screen">
                  <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                     <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                        <Navigation />
                        <UserMenuWrapper />
                     </div>
                  </nav>
                  
                  <main className="flex-1 w-full flex flex-col items-center py-12">
                     <div className="max-w-5xl w-full px-5">
                        {children}
                     </div>
                  </main>
                  
                  <footer className="w-full border-t py-8 mt-auto">
                     <div className="max-w-5xl mx-auto text-center text-xs">
                        <p>© {new Date().getFullYear()} Metrognome PMS</p>
                     </div>
                  </footer>
               </div>
            </ThemeProvider>
         </body>
      </html>
   );
}
