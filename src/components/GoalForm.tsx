"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function GoalForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const targetDateStr = formData.get("targetDate") as string;

    if (!title || !targetDateStr) {
      setError("タイトルと目標日は必須です");
      setIsLoading(false);
      return;
    }

    const targetDate = new Date(targetDateStr);

    try {
      // サーバーAPIを使用して学習計画を生成
      const aiController = new AbortController();
      const aiTimeoutId = setTimeout(() => aiController.abort(), 50000); // 50秒でタイムアウト

      try {
        const aiResponse = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: title,
            description,
            targetDate,
          }),
          signal: aiController.signal,
        });

        clearTimeout(aiTimeoutId);

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error || "AIによる学習計画の生成に失敗しました"
          );
        }

        const tasks = await aiResponse.json();

        // デバッグログを追加
        console.log("Creating goal with user ID:", userId);

        // 目標を作成
        const goalResponse = await fetch("/api/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            targetDate,
            userId: userId || "", // 空の場合は空文字列を送信（サーバー側でセッションIDを使用）
          }),
        });

        if (!goalResponse.ok) {
          const errorData = await goalResponse.json();
          console.error("Goal creation error:", errorData);
          throw new Error(
            "目標の作成に失敗しました: " + (errorData.error || "")
          );
        }

        const goal = await goalResponse.json();

        // 生成されたタスクを登録
        const today = new Date();
        const taskPromises = tasks.map(
          async (content: string, index: number) => {
            const taskDate = new Date(today);
            taskDate.setDate(today.getDate() + index);

            const taskResponse = await fetch("/api/tasks", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content,
                date: taskDate,
                goalId: goal.id,
              }),
            });

            if (!taskResponse.ok) {
              throw new Error("タスクの作成に失敗しました");
            }
          }
        );

        await Promise.all(taskPromises);

        // ダッシュボードにリダイレクト
        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "予期せぬエラーが発生しました"
        );
        console.error("Form submission error:", error);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
      console.error("Form submission error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // 最小日付は今日
  const today = new Date().toISOString().split("T")[0];

  // 最大日付は1年後
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow overflow-hidden sm:rounded-md"
    >
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div
            className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              目標タイトル
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
              placeholder="例: TOEIC 800点、基本情報技術者試験合格"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              詳細な目標（内容、レベルなど）
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
              placeholder="例: 現在のスコアは600点。リスニングが苦手なので、特に力を入れたい。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="targetDate"
              className="block text-sm font-medium text-gray-700"
            >
              目標達成日
            </label>
            <input
              type="date"
              name="targetDate"
              id="targetDate"
              min={today}
              max={maxDateString}
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              設定した日付までの学習計画が自動生成されます
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Link
          href="/goals"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? "処理中..." : "目標を作成して学習計画を生成"}
        </button>
      </div>
    </form>
  );
}
