import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-indigo-600 font-bold text-xl">
                StudyFlow
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-gray-600 hover:text-gray-800 hover:border-indigo-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                ホーム
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="border-transparent text-gray-600 hover:text-gray-800 hover:border-indigo-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/goals"
                    className="border-transparent text-gray-600 hover:text-gray-800 hover:border-indigo-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    学習目標
                  </Link>
                </>
              ) : null}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="mr-3 text-sm text-gray-700">
                    {user.name || "ユーザー"}さん
                  </div>
                  <div className="relative">
                    <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={
                          user.image ||
                          "https://ui-avatars.com/api/?name=User&background=6366F1&color=fff"
                        }
                        alt="ユーザープロフィール"
                      />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 hidden">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        プロフィール
                      </Link>
                      <Link
                        href="/api/auth/signout"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ログアウト
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ログイン
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">メニューを開く</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="sm:hidden hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className="bg-gray-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          >
            ホーム
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                ダッシュボード
              </Link>
              <Link
                href="/goals"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                学習目標
              </Link>
            </>
          ) : null}
        </div>
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={
                    user.image ||
                    "https://ui-avatars.com/api/?name=User&background=6366F1&color=fff"
                  }
                  alt="ユーザープロフィール"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {user.name || "ユーザー"}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                プロフィール
              </Link>
              <Link
                href="/api/auth/signout"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                ログアウト
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              <Link
                href="/api/auth/signin"
                className="block text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                ログイン
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
