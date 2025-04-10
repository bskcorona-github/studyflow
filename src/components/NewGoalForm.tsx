"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewGoalFormProps {
  userId: string;
}

export default function NewGoalForm({ userId }: NewGoalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    field: "",
    goal: "",
    deadline: "",
    daysPerWeek: 5,
    hoursPerDay: 2,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "daysPerWeek" || name === "hoursPerDay"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("目標の作成に失敗しました");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("目標の作成に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="card p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">基本情報</h2>
        
        <div className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">学習タイトル</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="例：TOEIC対策、簿記2級試験対策"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">学習分野</span>
            </label>
            <input
              type="text"
              name="field"
              value={formData.field}
              onChange={handleChange}
              placeholder="例：英語、会計、プログラミング"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">目標</span>
            </label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="例：TOEIC800点以上を取得する、基本情報技術者試験に合格する"
              className="textarea textarea-bordered w-full min-h-[120px]"
              required
            />
          </div>
        </div>
      </div>

      <div className="card p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">学習スケジュール</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">目標期限</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">週あたりの学習日数</span>
            </label>
            <select
              name="daysPerWeek"
              value={formData.daysPerWeek}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num}>
                  {num}日
                </option>
              ))}
            </select>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-gray-700">1日あたりの学習時間</span>
            </label>
            <select
              name="hoursPerDay"
              value={formData.hoursPerDay}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                <option key={num} value={num}>
                  {num}時間
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="btn btn-primary min-w-[160px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              処理中...
            </>
          ) : (
            "学習計画を作成"
          )}
        </button>
      </div>
    </form>
  );
}
