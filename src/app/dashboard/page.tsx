import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // 今日の日付
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ユーザーの目標と今日のタスクを取得
  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      dailyStudy: {
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  });

  // 完了したタスクの総数を取得
  const completedTasksCount = await prisma.dailyTask.count({
    where: {
      goal: {
        userId: session.user.id,
      },
      isCompleted: true,
    },
  });

  // 全タスクの総数を取得
  const totalTasksCount = await prisma.dailyTask.count({
    where: {
      goal: {
        userId: session.user.id,
      },
    },
  });

  // 進捗率の計算
  const progressRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              ダッシュボード
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
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                全体の進捗
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>全ての学習目標の進捗状況です。</p>
              </div>
              <div className="mt-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      {completedTasksCount} / {totalTasksCount} タスク完了
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {progressRate}%
                    </div>
                  </div>
                  <div className="mt-2 overflow-hidden bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progressRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            今日のタスク
          </h3>
          {goals.length === 0 ? (
            <div className="mt-4 bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
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
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h4 className="text-lg font-medium text-gray-900">
                      {goal.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      目標期限:{" "}
                      {new Date(goal.targetDate).toLocaleDateString("ja-JP")}
                    </p>
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        今日のタスク
                      </h5>
                      {goal.dailyStudy.length === 0 ? (
                        <p className="mt-2 text-sm text-gray-500">
                          今日のタスクはありません
                        </p>
                      ) : (
                        <ul className="mt-2 divide-y divide-gray-200">
                          {goal.dailyStudy.map((task) => (
                            <li key={task.id} className="py-3">
                              <div className="flex items-start">
                                <span className="h-5 flex items-center">
                                  <input
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    defaultChecked={task.isCompleted}
                                    disabled
                                  />
                                </span>
                                <span className="ml-3 text-sm text-black font-medium">
                                  {task.content}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4">
                        <Link
                          href={`/goals/${goal.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          詳細を見る →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
