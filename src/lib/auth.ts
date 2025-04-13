import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // ... existing configuration ...

  jwt: {
    // 最大セッション期間を30日に設定
    maxAge: 30 * 24 * 60 * 60, // 30日
  },

  session: {
    strategy: "jwt",
    // セッション有効期間を1日に設定
    maxAge: 24 * 60 * 60, // 1日
  },

  // ... rest of configuration ...
};
