import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="pt-10 mx-auto max-w-7xl px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">AI学習計画で</span>
                <span className="block text-primary-600">効率的に目標達成</span>
              </h1>
              <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                AIが学習目標に合わせて最適な学習計画を自動生成します。
                進捗に応じてスケジュールを自動調整し、効率的な学習をサポートします。
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                {user ? (
                  <div className="rounded-lg shadow">
                    <Link
                      href="/dashboard"
                      className="btn btn-primary btn-lg w-full"
                    >
                      ダッシュボードへ
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-lg shadow">
                    <Link
                      href="/api/auth/signin"
                      className="btn btn-primary btn-lg w-full"
                    >
                      始めましょう
                    </Link>
                  </div>
                )}
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#features"
                    className="btn btn-outline btn-lg w-full"
                  >
                    詳細を見る
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-lg lg:rounded-l-lg lg:rounded-r-none shadow-md"
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
          alt="学習イメージ"
        />
      </div>

      <div className="py-16 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              StudyFlow 特徴
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              AI搭載の学習管理システム
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              あなたの目標と生活リズムに合わせた最適な学習計画を自動で作成します。
            </p>
          </div>

          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
              <div className="relative p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-full bg-primary-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900">
                    AI学習計画の自動生成
                  </p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600">
                  あなたの目標、期限、学習可能日数からAIが最適な学習計画を作成します。学習内容を適切に分割し、無理のないペースで目標達成へ導きます。
                </dd>
              </div>

              <div className="relative p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-full bg-primary-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900">
                    自動リバランス機能
                  </p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600">
                  学習進捗の遅れや早さに応じて、残りの学習計画を自動的に調整。遅れを取り戻すための計画変更も自動で行います。
                </dd>
              </div>

              <div className="relative p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-full bg-primary-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900">
                    進捗の可視化
                  </p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600">
                  学習の進捗状況をグラフやチャートで視覚的に確認。目標達成までの道のりを明確に把握できます。
                </dd>
              </div>

              <div className="relative p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                <dt>
                  <div className="absolute flex items-center justify-center h-14 w-14 rounded-full bg-primary-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="ml-20 text-xl leading-6 font-medium text-gray-900">
                    「今日やること」の明確化
                  </p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-600">
                  複雑な学習計画も、今日すべきことだけを明確に表示。迷いなく学習に取り組めます。
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
