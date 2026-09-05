import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = typeof user.role === "string" ? user.role : "CLIENT";
        token.uid = typeof user.id === "string" ? user.id : "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = typeof token.role === "string" ? token.role : "CLIENT";
        session.user.id = typeof token.uid === "string" ? token.uid : "";
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isLogin = path === "/admin/login";
      const isAdminPage = path.startsWith("/admin") && !isLogin;
      const isAdminApi = path.startsWith("/api/admin") || path === "/api/upload";
      if (!isAdminPage && !isAdminApi) return true;
      return Boolean(auth?.user && auth.user.role === "ADMIN");
    },
  },
} satisfies NextAuthConfig;
