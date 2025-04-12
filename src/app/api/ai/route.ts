import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { subject, description, targetDate } = await request.json();

    const prompt = `
      あなたは学習計画を作成する専門家です。
      以下の情報を基に、学習者のための日毎の学習計画を作成してください。

      科目: ${subject}
      目標: ${description}
      目標達成日: ${new Date(targetDate).toISOString().split("T")[0]}
      現在の日付: ${new Date().toISOString().split("T")[0]}

      現在から目標達成日までの日数分の学習タスクを作成してください。
      各日のタスクは具体的で、1日あたり30分〜1時間程度で完了できる量にしてください。
      
      返答形式に関する重要な指示:
      1. タスクリストだけを返してください。説明や注釈は一切不要です。
      2. 以下の形式の配列だけを返してください:
      ["タスク1の内容", "タスク2の内容", ...]
      3. マークダウン記法は使用せず、純粋なJSONデータとして返してください。
      4. 各タスクはクォーテーションで囲まれた文字列であり、カンマで区切られます。
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 返されたテキストからJSON配列を抽出
    let cleanedText = text;

    // Markdownコードブロックがある場合は削除
    if (text.includes("```")) {
      cleanedText = text.replace(/```(?:json)?([\s\S]*?)```/g, "$1").trim();
    }

    // 前後の余分な文字を削除
    cleanedText = cleanedText.trim();

    try {
      let tasks;

      // JSONとして解析を試みる
      try {
        tasks = JSON.parse(cleanedText);
      } catch {
        // 配列部分だけを抽出して再試行（[ から始まり ] で終わる部分）
        const arrayMatch = cleanedText.match(/\[([\s\S]*)\]/);
        if (arrayMatch) {
          try {
            tasks = JSON.parse(`[${arrayMatch[1]}]`);
          } catch {
            throw new Error("JSONの解析に失敗しました");
          }
        } else {
          throw new Error("配列形式のデータが見つかりません");
        }
      }

      // タスク配列の検証と処理
      if (Array.isArray(tasks)) {
        // 各タスクをクリーニング
        const cleanedTasks = tasks
          .filter((task) => typeof task === "string") // 文字列のみフィルタリング
          .map((task) => {
            // クォートや不要な記号を削除
            return task
              .replace(/^["']|["'],?$/g, "") // 前後のクォートとカンマを削除
              .trim();
          })
          .filter((task) => {
            // 特殊文字や無意味なタスクを除外
            const invalidTasks = ["[", "]", "{", "}", "```", "```json"];
            return task && !invalidTasks.includes(task) && task.length > 1;
          });

        return NextResponse.json(cleanedTasks);
      } else {
        // 配列でない場合は、テキストを行ごとに分割して返す
        const lines = cleanedText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => {
            // 無効な行を除外
            return (
              line &&
              !line.match(/^\s*[\[\]{}]?\s*$/) && // 空行や括弧のみの行を除外
              !line.includes("```") && // マークダウン記法を除外
              line.length > 1
            ); // 短すぎる行を除外
          });

        return NextResponse.json(lines);
      }
    } catch (error) {
      console.error("JSON処理エラー:", error);

      // 最終手段: 行ごとに分割して明らかに無効な行を除外
      const fallbackLines = cleanedText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => {
          return (
            line &&
            !line.match(/^\s*[\[\]{}]?\s*$/) && // 空行や括弧のみの行を除外
            !line.includes("```") && // マークダウン記法を除外
            line.length > 5
          ); // 短すぎる行を除外
        })
        .map((line) => line.replace(/^["']|["'],?$/g, "").trim()); // クォートやカンマを削除

      return NextResponse.json(fallbackLines);
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "学習計画の生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
