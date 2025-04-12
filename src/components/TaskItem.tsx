"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskItemProps {
  task: {
    id: string;
    content: string;
    isCompleted: boolean;
    date: Date;
  };
}

export default function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleTaskStatus = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: task.id,
          isCompleted: newStatus,
        }),
      });

      if (!response.ok) {
        // エラーが発生した場合は元に戻す
        setIsCompleted(isCompleted);
        console.error("Failed to update task status");
      } else {
        // 更新成功時はキャッシュを再検証
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      setIsCompleted(isCompleted);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={`task-${task.id}`}
          type="checkbox"
          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
          checked={isCompleted}
          onChange={toggleTaskStatus}
          disabled={isUpdating}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={`task-${task.id}`}
          className={`font-medium ${
            isCompleted ? "line-through text-gray-400" : "text-black"
          }`}
        >
          {task.content}
        </label>
      </div>
    </div>
  );
}
