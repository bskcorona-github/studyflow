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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{goal.title}</h1>
        <div className="flex gap-2">
          <Link href="/goals" className="btn btn-outline btn-sm">
            すべての目標へ戻る
          </Link>
          <DeleteGoalButton goalId={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">進捗</div>
            <div className="stat-value">{progressPercentage}%</div>
            <div className="stat-desc">
              {completedSchedules}/{totalSchedules} 日完了
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">残り日数</div>
            <div className="stat-value">{daysRemaining}</div>
            <div className="stat-desc">
              {daysRemaining <= 0 ? "期限切れ" : "日"}
            </div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">学習頻度</div>
            <div className="stat-value">{goal.daysPerWeek}</div>
            <div className="stat-desc">日/週、{goal.hoursPerDay}時間/日</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">目標詳細</h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-bold">分野：</span>
              <span className="badge badge-primary">{goal.field}</span>
            </div>
            <div>
              <span className="font-bold">目標：</span>
              <p>{goal.goal}</p>
            </div>
            <div>
              <span className="font-bold">期限：</span>
              <p>{new Date(goal.deadline).toLocaleDateString("ja-JP")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">学習スケジュール</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>タスク数</th>
                  <th>進捗</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {goal.studySchedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className={schedule.isComplete ? "bg-base-200" : ""}
                  >
                    <td>
                      {new Date(schedule.date).toLocaleDateString("ja-JP")}
                    </td>
                    <td>{schedule.studyTasks.length}</td>
                    <td>
                      <progress
                        className="progress progress-primary w-20"
                        value={schedule.progress * 100}
                        max="100"
                      ></progress>
                      <span className="ml-2">
                        {Math.round(schedule.progress * 100)}%
                      </span>
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

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">未完了タスク</h2>

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
            ).length === 0 ? (
              <p>未完了タスクはありません</p>
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
