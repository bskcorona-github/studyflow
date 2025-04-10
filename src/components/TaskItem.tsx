"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditTaskModal from "./EditTaskModal";

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    isComplete: boolean;
    studyGoal: {
      title: string;
      field: string;
    };
    schedule: {
      date: Date;
    };
  };
}

export default function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(task.isComplete);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task.id,
          isComplete: !isComplete,
        }),
      });

      if (!response.ok) {
        throw new Error("タスクの更新に失敗しました");
      }

      setIsComplete(!isComplete);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("タスクの更新に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このタスクを削除してもよろしいですか？")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tasks?taskId=${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("タスクの削除に失敗しました");
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("タスクの削除に失敗しました。もう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className={`p-5 rounded-lg border transition-all hover:shadow-sm ${
          isComplete
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={isComplete}
                onChange={handleToggleComplete}
                disabled={isSubmitting}
                className="checkbox checkbox-primary w-6 h-6"
              />
              <span className="sr-only">タスク完了</span>
            </label>
          </div>
          <div className="flex-grow">
            <h3
              className={`text-lg font-medium ${
                isComplete ? "line-through text-gray-500" : "text-gray-800"
              }`}
            >
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge badge-primary">
                {task.studyGoal.field}
              </span>
              <span className="badge badge-outline">
                {task.studyGoal.title}
              </span>
              <span className="badge badge-ghost">
                {formatDate(task.schedule.date)}
              </span>
            </div>
            {task.description && (
              <p className={`mt-3 text-sm text-gray-600 ${isComplete ? "opacity-60" : ""}`}>
                {task.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-ghost btn-sm"
              disabled={isDeleting}
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-sm text-error"
              disabled={isDeleting}
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </div>
        </div>
      </div>

      <EditTaskModal
        taskId={task.id}
        initialTitle={task.title}
        initialDescription={task.description ?? null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
}
