import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import TaskItem from "@/components/TaskItem";

const prisma = new PrismaClient();

export default async function Tasks() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  // ユーザーの学習目標を取得
  const goals = await prisma.studyGoal.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
    },
  });

  // 未完了のタスクを取得
  const incompleteTasks = await prisma.studyTask.findMany({
    where: {
      isComplete: false,
      studyGoal: {
        userId: user.id,
      },
    },
    include: {
      studyGoal: {
        select: {
          title: true,
          field: true,
        },
      },
      schedule: {
        select: {
          date: true,
        },
      },
    },
    orderBy: [
      {
        schedule: {
          date: "asc",
        },
      },
      {
        createdAt: "asc",
      },
    ],
    take: 20, // 最初の20件のみ取得
  });

  // 完了済みタスクを取得
  const completedTasks = await prisma.studyTask.findMany({
    where: {
      isComplete: true,
      studyGoal: {
        userId: user.id,
      },
    },
    include: {
      studyGoal: {
        select: {
          title: true,
          field: true,
        },
      },
      schedule: {
        select: {
          date: true,
        },
      },
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
    take: 10, // 最近完了した10件のみ取得
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">学習タスク一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">未完了タスク</h2>
            {incompleteTasks.length > 0 ? (
              <div className="space-y-4">
                {incompleteTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p>未完了タスクはありません</p>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">完了済みタスク</h2>
            {completedTasks.length > 0 ? (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p>完了済みタスクはありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
