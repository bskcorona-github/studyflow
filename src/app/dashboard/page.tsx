import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import GoalsList from "@/components/GoalsList";

const prisma = new PrismaClient();

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  const goals = await prisma.studyGoal.findMany({
    where: {
      userId: user.id,
    },
    include: {
      studySchedules: true,
    },
  });

  // 今日の学習タスク
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySchedules = await prisma.studySchedule.findMany({
    where: {
      goalId: { in: goals.map((goal) => goal.id) },
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      studyTasks: true,
      studyGoal: true,
    },
  });

  const todayTasks = todaySchedules.flatMap((schedule) =>
    schedule.studyTasks.map((task) => ({
      ...task,
      goalTitle: schedule.studyGoal.title,
    }))
  );

  // 各目標の進捗状況を計算
  const goalsWithProgress = goals.map((goal) => {
    // 進捗を計算
    const totalSchedules = goal.studySchedules.length;
    const completedSchedules = goal.studySchedules.filter(
      (s) => s.isComplete
    ).length;
    const progress =
      totalSchedules > 0
        ? Math.round((completedSchedules / totalSchedules) * 100)
        : 0;

    // 残り日数を計算
    const deadline = new Date(goal.deadline);
    const remainingDays = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 今日のタスク数
    const todaySchedule = todaySchedules.find((s) => s.goalId === goal.id);

    const tasksToday = todaySchedule?.studyTasks.length || 0;
    const completedTasksToday = todaySchedule
      ? todaySchedule.studyTasks.filter((t) => t.isComplete).length
      : 0;

    return {
      id: goal.id,
      title: goal.title,
      field: goal.field,
      deadline: goal.deadline,
      progress,
      remainingDays,
      tasksToday,
      completedTasksToday,
    };
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="layout-container py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">
            学習の進捗状況と今日のタスクを確認できます
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  学習目標
                </h2>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {goals.length}
                </p>
                <Link
                  href="/goals"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
                >
                  すべての目標を見る →
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-accent-light bg-opacity-20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-accent"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  今日のタスク
                </h2>
                <p className="text-3xl font-bold text-accent mt-1">
                  {todayTasks.length}
                </p>
                <Link
                  href="/tasks"
                  className="text-sm text-accent hover:text-accent-dark font-medium mt-2 inline-block"
                >
                  すべてのタスクを見る →
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-md transition-all">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-success bg-opacity-20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-success"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  完了タスク
                </h2>
                <p className="text-3xl font-bold text-success mt-1">
                  {todayTasks.filter((task) => task.isComplete).length} /{" "}
                  {todayTasks.length}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(
                    (todayTasks.filter((task) => task.isComplete).length /
                      Math.max(todayTasks.length, 1)) *
                      100
                  )}
                  % 完了
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">学習目標</h2>
            <Link href="/goals/new" className="btn btn-primary btn-sm">
              新しい目標を追加
            </Link>
          </div>
          <GoalsList goals={goalsWithProgress} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              今日の学習タスク
            </h2>
            <Link href="/tasks" className="btn btn-outline btn-sm">
              すべてのタスクを見る
            </Link>
          </div>

          <div className="card overflow-hidden">
            {todayTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {todayTasks.map((task) => (
                  <li
                    key={task.id}
                    className="p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {task.isComplete ? (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-green-600"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-base font-medium ${
                            task.isComplete
                              ? "line-through text-gray-500"
                              : "text-gray-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="badge badge-primary">
                            {task.goalTitle}
                          </span>
                          {task.description && (
                            <p className="text-xs text-gray-600 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-16 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-4 text-gray-600 text-lg">
                  今日の学習タスクはありません
                </p>
                <div className="mt-6">
                  <Link href="/goals/new" className="btn btn-primary">
                    学習目標を追加する
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
