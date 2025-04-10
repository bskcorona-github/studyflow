import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function Goals() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  const goals = await prisma.studyGoal.findMany({
    where: {
      userId: user.id,
    },
    include: {
      studySchedules: {
        include: {
          studyTasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 今日の日付を取得
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">学習目標</h1>
        <Link href="/goals/new" className="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          新しい目標を追加
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">まだ学習目標がありません</h2>
          <p className="mb-8 text-gray-600 max-w-md mx-auto">
            新しい学習目標を設定して、AIに学習計画を立ててもらいましょう！
          </p>
          <Link href="/goals/new" className="btn btn-primary btn-lg">
            最初の目標を設定する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            // 目標の進捗を計算
            const totalSchedules = goal.studySchedules.length;
            const completedSchedules = goal.studySchedules.filter(
              (s) => s.isComplete
            ).length;
            const progressPercentage =
              totalSchedules > 0
                ? Math.round((completedSchedules / totalSchedules) * 100)
                : 0;

            // 残り日数を計算
            const deadline = new Date(goal.deadline);
            const daysRemaining = Math.ceil(
              (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            // 本日のタスク
            const todaySchedule = goal.studySchedules.find((s) => {
              const scheduleDate = new Date(s.date);
              return (
                scheduleDate.getDate() === today.getDate() &&
                scheduleDate.getMonth() === today.getMonth() &&
                scheduleDate.getFullYear() === today.getFullYear()
              );
            });

            return (
              <div key={goal.id} className="card bg-white shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <div className="card-body p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-xl text-gray-800">{goal.title}</h2>
                    <span className="badge badge-primary">{goal.field}</span>
                  </div>

                  <p className="mt-2 mb-4 text-gray-600">{goal.goal}</p>

                  <div className="mb-5">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-700">進捗状況</span>
                      <span className="font-medium text-primary">{progressPercentage}%</span>
                    </div>
                    <progress
                      className="progress progress-primary w-full h-3"
                      value={progressPercentage}
                      max="100"
                    ></progress>
                  </div>

                  <div className="stats stats-vertical lg:stats-horizontal bg-gray-50 shadow-sm rounded-lg mb-5">
                    <div className="stat">
                      <div className="stat-title text-gray-600">残り日数</div>
                      <div className="stat-value text-primary text-2xl">
                        {daysRemaining}
                      </div>
                      <div className="stat-desc text-gray-500">
                        {new Date(goal.deadline).toLocaleDateString("ja-JP")}
                        まで
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title text-gray-600">完了日数</div>
                      <div className="stat-value text-2xl">
                        {completedSchedules}/{totalSchedules}
                      </div>
                      <div className="stat-desc text-gray-500">計画された日数</div>
                    </div>
                  </div>

                  {todaySchedule && (
                    <div className="mb-5">
                      <h3 className="font-medium text-gray-700 mb-2">今日のタスク</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">進捗</span>
                          <span className="font-medium">
                            {Math.round(todaySchedule.progress * 100)}%
                          </span>
                        </div>
                        <progress
                          className="progress progress-accent w-full h-2 mb-3"
                          value={todaySchedule.progress * 100}
                          max="100"
                        ></progress>
                        <div className="text-sm text-gray-600">
                          {
                            todaySchedule.studyTasks.filter((t) => t.isComplete)
                              .length
                          }
                          /{todaySchedule.studyTasks.length} タスク完了
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-end mt-2">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
