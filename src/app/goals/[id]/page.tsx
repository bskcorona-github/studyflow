import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TaskItem from "@/components/TaskItem";
import DeleteGoalButton from "@/components/DeleteGoalButton";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GoalDetail({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Next.js 15ではparamsをawaitする必要がある
  const resolvedParams = await params;
  const goalId = resolvedParams.id;

  // 目標の詳細情報を取得
  const goal = await prisma.goal.findUnique({
    where: {
      id: goalId,
    },
    include: {
      dailyStudy: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  // 目標が存在しない、または自分の目標でない場合はリダイレクト
  if (!goal || goal.userId !== session.user.id) {
    redirect("/goals");
  }

  // 完了したタスクの数
  const completedTasksCount = goal.dailyStudy.filter(
    (task) => task.isCompleted
  ).length;

  // 進捗率の計算
  const progressRate =
    goal.dailyStudy.length > 0
      ? Math.round((completedTasksCount / goal.dailyStudy.length) * 100)
      : 0;

  // 日付でタスクをグループ化
  const tasksByDate: { [key: string]: typeof goal.dailyStudy } = {};
  goal.dailyStudy.forEach((task) => {
    const dateKey = new Date(task.date).toLocaleDateString("ja-JP");
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  // 現在の日付
  const today = new Date().toLocaleDateString("ja-JP");

  // 目標期限までの残り日数
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 期限に応じたラベルのスタイルと文言
  const deadlineStyle =
    diffDays < 0
      ? "bg-red-100 text-red-800"
      : diffDays < 7
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";

  const deadlineText =
    diffDays < 0
      ? "期限切れ"
      : diffDays === 0
      ? "今日が期限"
      : `あと${diffDays}日`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {goal.title}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/goals"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← 目標一覧に戻る
            </Link>
            <div className="ml-3">
              <DeleteGoalButton goalId={goalId} />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  目標の詳細
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>{goal.description || "詳細な説明はありません。"}</p>
                </div>
              </div>
              <div>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      目標期限
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(goal.targetDate).toLocaleDateString("ja-JP")}
                      <span
                        className={`ml-2 text-xs inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${deadlineStyle}`}
                      >
                        {deadlineText}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      作成日
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(goal.createdAt).toLocaleDateString("ja-JP")}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      進捗状況
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {completedTasksCount} / {goal.dailyStudy.length}{" "}
                          タスク完了
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {progressRate}%
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${progressRate}%` }}
                        ></div>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            学習スケジュール
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            AIが生成した日ごとの学習タスク一覧です。
          </p>

          <div className="mt-4 space-y-4">
            {Object.entries(tasksByDate).map(([date, tasks]) => (
              <div
                key={date}
                className="bg-white shadow overflow-hidden sm:rounded-lg"
              >
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    {date}
                    {date === today && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        今日
                      </span>
                    )}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter((t) => t.isCompleted).length} / {tasks.length}{" "}
                    完了
                  </span>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <li key={task.id} className="px-4 py-4 sm:px-6">
                        <TaskItem task={task} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
