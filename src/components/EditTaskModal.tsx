"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditTaskModalProps {
  taskId: string;
  initialTitle: string;
  initialDescription: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTaskModal({
  taskId,
  initialTitle,
  initialDescription,
  isOpen,
  onClose,
}: EditTaskModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // モーダルが開かれたときに初期値をセット
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription || "");
      setError("");
    }
  }, [isOpen, initialTitle, initialDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!title.trim()) {
      setError("タイトルを入力してください");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          title,
          description: description || null,
        }),
      });

      if (!response.ok) {
        throw new Error("タスクの更新に失敗しました");
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setError("タスクの更新に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">タスクを編集</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
              placeholder="タスクのタイトルを入力"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full h-32"
              placeholder="タスクの詳細を入力（任意）"
            />
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "更新中..." : "更新する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
