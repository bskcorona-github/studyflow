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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">タスクを編集</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル<span className="text-red-500 ml-1">*</span>
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

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full min-h-[120px]"
              placeholder="タスクの詳細を入力（任意）"
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  更新中...
                </>
              ) : (
                "更新する"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
