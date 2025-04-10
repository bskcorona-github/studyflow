"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function LoginButton() {
  return (
    <button className="btn btn-primary" onClick={() => signIn()}>
      ログイン
    </button>
  );
}

export function LogoutButton() {
  return (
    <button className="btn btn-outline" onClick={() => signOut()}>
      ログアウト
    </button>
  );
}

export function AuthStatus() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span>ようこそ、{session.user.name}さん</span>
        <LogoutButton />
      </div>
    );
  }

  return <LoginButton />;
}
