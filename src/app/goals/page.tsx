import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GoalsList() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // ユーザーの目標をすべて取得
  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      targetDate: "asc",
    },
    include: {
      _count: {
        select: { dailyStudy: true },
      },
      dailyStudy: {
        where: {
          isCompleted: true,
        },
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              学習目標一覧
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/goals/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              新しい目標を追加
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {goals.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md px-4 py-5 sm:p-6">
              <p className="text-center text-gray-500">
                まだ学習目標が設定されていません。
                <Link
                  href="/goals/new"
                  className="text-blue-600 hover:underline ml-1"
                >
                  目標を追加しましょう
                </Link>
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {goals.map((goal) => {
                  // 進捗率の計算
                  const totalTasks = goal._count.dailyStudy;
                  const completedTasks = goal.dailyStudy.length;
                  const progressRate =
                    totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : 0;

                  // 目標期限までの残り日数
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const targetDate = new Date(goal.targetDate);
                  const diffTime = targetDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <li key={goal.id}>
                      <Link
                        href={`/goals/${goal.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {goal.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  diffDays < 0
                                    ? "bg-red-100 text-red-800"
                                    : diffDays < 7
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {diffDays < 0
                                  ? "期限切れ"
                                  : diffDays === 0
                                  ? "今日が期限"
                                  : `あと${diffDays}日`}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {goal.description
                                  ? goal.description.length > 50
                                    ? goal.description.substring(0, 50) + "..."
                                    : goal.description
                                  : "詳細なし"}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                目標期限:{" "}
                                {new Date(goal.targetDate).toLocaleDateString(
                                  "ja-JP"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-medium text-gray-700">
                                進捗: {completedTasks} / {totalTasks} タスク完了
                              </div>
                              <div className="text-xs font-medium text-gray-700">
                                {progressRate}%
                              </div>
                            </div>
                            <div className="mt-1 overflow-hidden bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${progressRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
