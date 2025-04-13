import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  jwt: {
    // 最大セッション期間を30日に設定
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  session: {
    strategy: "jwt",
    // セッション有効期間を1日に設定
    maxAge: 24 * 60 * 60, // 1日
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  // 明示的にシークレットを設定
  secret: process.env.NEXTAUTH_SECRET,
};
