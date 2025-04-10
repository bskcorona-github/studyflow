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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">学習目標</h1>
        <Link href="/goals/new" className="btn btn-primary">
          新しい目標を追加
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">まだ学習目標がありません</h2>
          <p className="mb-8">
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
              <div key={goal.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{goal.title}</h2>
                    <span className="badge badge-primary">{goal.field}</span>
                  </div>

                  <p className="mb-2">{goal.goal}</p>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>進捗状況</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={progressPercentage}
                      max="100"
                    ></progress>
                  </div>

                  <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
                    <div className="stat">
                      <div className="stat-title">残り日数</div>
                      <div className="stat-value text-primary">
                        {daysRemaining}
                      </div>
                      <div className="stat-desc">
                        {new Date(goal.deadline).toLocaleDateString("ja-JP")}
                        まで
                      </div>
                    </div>

                    <div className="stat">
                      <div className="stat-title">完了日数</div>
                      <div className="stat-value">
                        {completedSchedules}/{totalSchedules}
                      </div>
                      <div className="stat-desc">計画された日数</div>
                    </div>
                  </div>

                  {todaySchedule && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">今日のタスク</h3>
                      <div className="bg-base-200 p-3 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <span>進捗</span>
                          <span>
                            {Math.round(todaySchedule.progress * 100)}%
                          </span>
                        </div>
                        <progress
                          className="progress progress-accent w-full mb-2"
                          value={todaySchedule.progress * 100}
                          max="100"
                        ></progress>
                        <div className="text-sm">
                          {
                            todaySchedule.studyTasks.filter((t) => t.isComplete)
                              .length
                          }
                          /{todaySchedule.studyTasks.length} タスク完了
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card-actions justify-end">
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
