import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CLIENT";
        token.uid = (user as { id?: string }).id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "CLIENT";
        (session.user as { id?: string }).id = (token.uid as string) ?? "";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLogin = request.nextUrl.pathname === "/admin/login";
      if (!isAdminRoute || isLogin) return true;
      return Boolean(auth?.user && (auth.user as { role?: string }).role === "ADMIN");
    },
  },
} satisfies NextAuthConfig;
