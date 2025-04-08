import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import { Home, Trophy, Users, CheckSquare, User, LogOut } from "lucide-react"
import { NavItemProps } from "@/types"
import { Providers } from "./providers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import type { AuthOptions } from "next-auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GolfDegens - Lose Money Golfing",
  description: "A web application for tracking long-running golf competitions between friends.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions as AuthOptions);
  const user = session?.user;
  console.log("session", session);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen">
              {/* Sidebar navigation - hidden on mobile */}
              <aside className="hidden md:flex w-64 flex-col bg-green-800 text-white">
                <div className="p-4 border-b border-green-700">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 18C12 18 8 14 8 9C8 5.68629 9.79086 3 12 3C14.2091 3 16 5.68629 16 9C16 14 12 18 12 18Z"
                          fill="#0F5132"
                        />
                        <path
                          d="M12 21C10.3431 21 9 19.6569 9 18C9 16.3431 10.3431 15 12 15C13.6569 15 15 16.3431 15 18C15 19.6569 13.6569 21 12 21Z"
                          fill="#0F5132"
                        />
                      </svg>
                    </div>
                    <span className="text-xl font-bold">GolfDegens</span>
                  </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  <NavItem href="/dashboard" icon={<Home className="h-5 w-5" />} label="Dashboard" />
                  <NavItem href="/matches" icon={<Trophy className="h-5 w-5" />} label="Matches" />
                  <NavItem href="/competitions" icon={<CheckSquare className="h-5 w-5" />} label="Competitions" />
                  <NavItem href="/friends" icon={<Users className="h-5 w-5" />} label="Friends" />
                </nav>

                <div className="p-4 border-t border-green-700">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-700 p-1 rounded-full">
                          {user.image ? (
                            <img src={user.image} alt={user.name || "User"} className="h-5 w-5 rounded-full" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-green-300">{user.friendId || "No Friend ID"}</div>
                        </div>
                      </div>
                      <Link href="/api/auth/signout">
                        <Button variant="ghost" size="icon" className="text-green-300 hover:text-white hover:bg-green-700">
                          <LogOut className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/api/auth/signin">
                      <Button className="w-full bg-green-700 hover:bg-green-600">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </aside>

              {/* Mobile header - visible only on mobile */}
              <header className="md:hidden fixed top-0 left-0 right-0 bg-green-800 text-white z-10">
                <div className="flex items-center justify-between p-4">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 18C12 18 8 14 8 9C8 5.68629 9.79086 3 12 3C14.2091 3 16 5.68629 16 9C16 14 12 18 12 18Z"
                          fill="#0F5132"
                        />
                        <path
                          d="M12 21C10.3431 21 9 19.6569 9 18C9 16.3431 10.3431 15 12 15C13.6569 15 15 16.3431 15 18C15 19.6569 13.6569 21 12 21Z"
                          fill="#0F5132"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-bold">GolfDegens</span>
                  </Link>

                  {user ? (
                    <Link href="/api/auth/signout">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/api/auth/signin">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                        <User className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 md:pt-0 pt-16 pb-16 md:pb-0">{children}</main>

              {/* Mobile navigation - visible only on mobile */}
              <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
                <div className="flex justify-around">
                  <MobileNavItem href="/dashboard" icon={<Home className="h-5 w-5" />} label="Home" />
                  <MobileNavItem href="/matches" icon={<Trophy className="h-5 w-5" />} label="Matches" />
                  <MobileNavItem href="/competitions" icon={<CheckSquare className="h-5 w-5" />} label="Compete" />
                  <MobileNavItem href="/friends" icon={<Users className="h-5 w-5" />} label="Friends" />
                </div>
              </nav>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

function NavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-green-700 transition-colors">
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function MobileNavItem({ href, icon, label }: NavItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-green-800">
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  )
}


// globals.css is already imported at the top
