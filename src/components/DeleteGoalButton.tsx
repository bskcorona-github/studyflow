"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteGoalButtonProps {
  goalId: string;
}

export default function DeleteGoalButton({ goalId }: DeleteGoalButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "この学習目標を削除してもよろしいですか？関連するすべてのスケジュールとタスクも削除されます。"
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("目標の削除に失敗しました");
      }

      router.push("/goals");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("目標の削除に失敗しました。もう一度お試しください。");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-error"
      disabled={isDeleting}
    >
      {isDeleting ? "削除中..." : "目標を削除"}
    </button>
  );
}
