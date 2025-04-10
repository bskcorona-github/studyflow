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
        className={`p-4 rounded-lg border ${
          isComplete
            ? "bg-base-200 border-base-300"
            : "bg-base-100 border-base-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={handleToggleComplete}
            disabled={isSubmitting}
            className="checkbox checkbox-primary mt-1"
          />
          <div className="flex-grow">
            <h3
              className={`font-medium ${
                isComplete ? "line-through opacity-70" : ""
              }`}
            >
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="badge badge-primary badge-sm">
                {task.studyGoal.field}
              </span>
              <span className="badge badge-outline badge-sm">
                {task.studyGoal.title}
              </span>
              <span className="badge badge-ghost badge-sm">
                {formatDate(task.schedule.date)}
              </span>
            </div>
            {task.description && (
              <p className={`mt-2 text-sm ${isComplete ? "opacity-50" : ""}`}>
                {task.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-ghost btn-xs"
              disabled={isDeleting}
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs text-error"
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
