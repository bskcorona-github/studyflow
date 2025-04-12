"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">StudyFlow</span>
            </Link>
            {session && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/goals"
                  className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  学習目標
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user?.name}
                </span>
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "ユーザー"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="ml-2 bg-white border border-gray-300 rounded-md shadow-sm py-1.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-blue-600 text-white rounded-md shadow-sm py-1.5 px-4 text-sm font-medium hover:bg-blue-700"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
