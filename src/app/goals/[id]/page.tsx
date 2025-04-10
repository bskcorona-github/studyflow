import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import TaskItem from "@/components/TaskItem";
import DeleteGoalButton from "@/components/DeleteGoalButton";

const prisma = new PrismaClient();

interface GoalDetailProps {
  params: {
    id: string;
  };
}

export default async function GoalDetail({ params }: GoalDetailProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  const id = (await Promise.resolve(params)).id;

  // 学習目標の詳細を取得
  const goal = await prisma.studyGoal.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      studySchedules: {
        include: {
          studyTasks: true,
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  if (!goal) {
    notFound();
  }

  // 学習目標の進捗を計算
  const totalSchedules = goal.studySchedules.length;
  const completedSchedules = goal.studySchedules.filter(
    (s) => s.isComplete
  ).length;
  const progressPercentage =
    totalSchedules > 0
      ? Math.round((completedSchedules / totalSchedules) * 100)
      : 0;

  // 残り日数を計算
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(goal.deadline);
  const daysRemaining = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{goal.title}</h1>
        <div className="flex gap-3">
          <Link href="/goals" className="btn btn-outline">
            すべての目標へ戻る
          </Link>
          <DeleteGoalButton goalId={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats shadow-md bg-white rounded-xl">
          <div className="stat">
            <div className="stat-title text-gray-600">進捗</div>
            <div className="stat-value text-primary">{progressPercentage}%</div>
            <div className="stat-desc text-gray-500">
              {completedSchedules}/{totalSchedules} 日完了
            </div>
          </div>
        </div>

        <div className="stats shadow-md bg-white rounded-xl">
          <div className="stat">
            <div className="stat-title text-gray-600">残り日数</div>
            <div className="stat-value text-accent">{daysRemaining}</div>
            <div className="stat-desc text-gray-500">
              {daysRemaining <= 0 ? "期限切れ" : "日"}
            </div>
          </div>
        </div>

        <div className="stats shadow-md bg-white rounded-xl">
          <div className="stat">
            <div className="stat-title text-gray-600">学習頻度</div>
            <div className="stat-value text-secondary">{goal.daysPerWeek}</div>
            <div className="stat-desc text-gray-500">日/週、{goal.hoursPerDay}時間/日</div>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow-md rounded-xl">
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold text-gray-800">目標詳細</h2>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <span className="font-medium text-gray-700">分野：</span>
              <span className="badge badge-primary ml-2">{goal.field}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">目標：</span>
              <p className="mt-1 text-gray-600">{goal.goal}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">期限：</span>
              <p className="mt-1 text-gray-600">{new Date(goal.deadline).toLocaleDateString("ja-JP")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow-md rounded-xl">
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold text-gray-800">学習スケジュール</h2>

          <div className="overflow-x-auto mt-4">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-gray-700">日付</th>
                  <th className="text-gray-700">タスク数</th>
                  <th className="text-gray-700">進捗</th>
                  <th className="text-gray-700">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {goal.studySchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className={schedule.isComplete ? "bg-gray-50" : ""}
                  >
                    <td className="font-medium">
                      {new Date(schedule.date).toLocaleDateString("ja-JP")}
                    </td>
                    <td>{schedule.studyTasks.length}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <progress
                          className="progress progress-primary w-24"
                          value={schedule.progress * 100}
                          max="100"
                        ></progress>
                        <span className="text-gray-600">
                          {Math.round(schedule.progress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {schedule.isComplete ? (
                        <span className="badge badge-success">完了</span>
                      ) : new Date(schedule.date) < today ? (
                        <span className="badge badge-error">期限切れ</span>
                      ) : (
                        <span className="badge badge-info">予定</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow-md rounded-xl">
        <div className="card-body">
          <h2 className="card-title text-xl font-semibold text-gray-800">未完了タスク</h2>

          <div className="space-y-4 mt-4">
            {goal.studySchedules.flatMap((schedule) =>
              schedule.studyTasks
                .filter((task) => !task.isComplete)
                .map((task) => (
                  <TaskItem
                    key={task.id}
                    task={{
                      ...task,
                      studyGoal: {
                        title: goal.title,
                        field: goal.field,
                      },
                      schedule: {
                        date: schedule.date,
                      },
                    }}
                  />
                ))
            ).length === 0 ? (
              <p className="text-gray-500 py-4 text-center">未完了タスクはありません</p>
            ) : (
              <div className="space-y-4">
                {goal.studySchedules.flatMap((schedule) =>
                  schedule.studyTasks
                    .filter((task) => !task.isComplete)
                    .map((task) => (
                      <TaskItem
                        key={task.id}
                        task={{
                          ...task,
                          studyGoal: {
                            title: goal.title,
                            field: goal.field,
                          },
                          schedule: {
                            date: schedule.date,
                          },
                        }}
                      />
                    ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
