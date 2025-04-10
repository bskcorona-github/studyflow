"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Goal {
  id: string;
  title: string;
  field: string;
  deadline: Date;
  progress: number;
  remainingDays: number;
  tasksToday: number;
  completedTasksToday: number;
}

interface GoalsListProps {
  goals: Goal[];
}

export default function GoalsList({ goals }: GoalsListProps) {
  const router = useRouter();
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const handleDelete = async (goalId: string) => {
    if (
      !confirm(
        "この学習目標を削除してもよろしいですか？関連するすべてのスケジュールとタスクも削除されます。"
      )
    ) {
      return;
    }

    setDeletingGoalId(goalId);

    try {
      const response = await fetch(`/api/goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("目標の削除に失敗しました");
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("目標の削除に失敗しました。もう一度お試しください。");
    } finally {
      setDeletingGoalId(null);
    }
  };

  if (goals.length === 0) {
    return (
      <div className="card p-16 text-center">
        <svg
          className="w-20 h-20 mx-auto text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-6 text-xl text-gray-800 font-medium">
          学習目標がありません
        </h3>
        <p className="mt-3 text-gray-600">
          最初の学習目標を設定して、学習計画を始めましょう
        </p>
        <div className="mt-8">
          <Link href="/goals/new" className="btn btn-primary btn-lg">
            新しい目標を追加
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="card overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="hover:text-primary-600 transition-colors"
                    >
                      {goal.title}
                    </Link>
                  </h3>
                  <span className="badge badge-primary">{goal.field}</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  期限: {new Date(goal.deadline).toLocaleDateString("ja-JP")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/goals/${goal.id}`}
                  className="btn btn-outline btn-sm"
                >
                  詳細
                </Link>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="btn btn-error btn-sm"
                  disabled={deletingGoalId === goal.id}
                >
                  {deletingGoalId === goal.id ? (
                    <span className="flex items-center gap-1">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      削除中
                    </span>
                  ) : (
                    "削除"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">進捗</span>
                <span className="text-sm font-medium text-gray-800">
                  {goal.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    goal.progress < 30
                      ? "bg-red-500"
                      : goal.progress < 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  className="h-5 w-5 text-primary-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  {goal.remainingDays <= 0
                    ? "期限切れ"
                    : `残り ${goal.remainingDays} 日`}
                </span>
              </div>

              {goal.tasksToday > 0 && (
                <div className="flex items-center gap-2 text-gray-700">
                  <svg
                    className="h-5 w-5 text-accent"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    今日のタスク: {goal.completedTasksToday}/{goal.tasksToday}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
