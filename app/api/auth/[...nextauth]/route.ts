import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

// Generate a random string for the friendId
function generateFriendId(): string {
  return `golf_${Math.random().toString(36).substring(2, 10)}`;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with the same email
    }),
  ],
  callbacks: {
    async session({ session, user, token }: any) {
      // Add user ID to the session
      if (session.user) {
        // If using JWT strategy, get the ID from the token
        if (token?.sub) {
          session.user.id = token.sub;
        } 
        // If using database strategy, get the ID from the user object
        else if (user?.id) {
          session.user.id = user.id;
        }
        
        // Check if user has a friendId, if not, create one
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        
        if (dbUser && !dbUser.friendId) {
          const friendId = generateFriendId();
          await prisma.user.update({
            where: { id: session.user.id },
            data: { friendId },
          });
          session.user.friendId = friendId;
        } else if (dbUser) {
          session.user.friendId = dbUser.friendId;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }: any) {
      // Add custom claims to the JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }: any) {
      // Always allow sign in
      if (user.email) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          try {
            // Create a new user if they don't exist
            await prisma.user.create({
              data: {
                id: user.id,
                name: user.name || profile?.name,
                email: user.email,
                image: user.image,
                friendId: generateFriendId(),
              },
            });
          } catch (error) {
            console.error("Error creating user:", error);
            // Continue anyway - the adapter will handle this
          }
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const, // Use JWT for sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };