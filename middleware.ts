import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  // Get the pathname of the request
  const path = req.nextUrl.pathname

  // Define public and protected routes
  const publicRoutes = ["/", "/login"]
  const protectedRoutes = ["/dashboard", "/matches", "/competitions", "/friends"]

  // Check if the path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  // Redirect authenticated users from public routes to dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
