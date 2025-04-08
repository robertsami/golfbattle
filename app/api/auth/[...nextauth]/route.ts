import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

// Generate a random string for the friendId
function generateFriendId(): string {
  return `golf_${Math.random().toString(36).substring(2, 10)}`;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = user.id;
        
        // Check if user has a friendId, if not, create one
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        
        if (dbUser && !dbUser.friendId) {
          const friendId = generateFriendId();
          await prisma.user.update({
            where: { id: user.id },
            data: { friendId },
          });
          session.user.friendId = friendId;
        } else if (dbUser) {
          session.user.friendId = dbUser.friendId;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      // Create or update user in our database
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          // Create a new user
          await prisma.user.create({
            data: {
              id: user.id,
              name: user.name || profile.name,
              email: user.email,
              friendId: generateFriendId(),
            },
          });
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
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };