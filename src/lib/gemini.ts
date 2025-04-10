import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateStudyPlan(
  field: string,
  goal: string,
  deadline: Date,
  daysPerWeek: number,
  hoursPerDay: number
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalDays = Math.floor((daysUntilDeadline * daysPerWeek) / 7);
    const totalHours = totalDays * hoursPerDay;

    const prompt = `
      あなたは学習計画の専門家です。以下の条件に基づいて詳細な学習計画を作成してください。
      
      学習分野: ${field}
      目標: ${goal}
      期限: ${
        deadline.toISOString().split("T")[0]
      }（残り${daysUntilDeadline}日）
      週あたりの学習日数: ${daysPerWeek}日
      1日あたりの学習時間: ${hoursPerDay}時間
      合計学習日数: 約${totalDays}日
      合計学習時間: 約${totalHours}時間
      
      以下の形式でJSON形式の学習計画を提供してください:
      
      {
        "summary": "学習計画の概要（200文字以内）",
        "recommendedMaterials": ["推奨教材1", "推奨教材2", ...],
        "dailyTasks": [
          {
            "day": 1,
            "date": "YYYY-MM-DD",
            "tasks": [
              {
                "title": "タスクのタイトル",
                "description": "詳細な説明（何をどのように学ぶか）",
                "estimatedMinutes": 30
              },
              ...最大5つのタスク
            ]
          },
          ...${totalDays}日分
        ]
      }
      
      重要なポイント:
      - 学習の進捗に合わせて段階的に難易度を上げてください
      - 各日の合計学習時間が指定された1日の学習時間に近くなるようにしてください
      - タスクは具体的で、明確な目標を持つものにしてください
      - 定期的な復習と確認テストを含めてください
      - JSONのみを出力し、余分な説明は不要です
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONを抽出
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/```\n([\s\S]*?)\n```/) ||
      text.match(/\{[\s\S]*\}/);

    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    try {
      const cleanedJson = jsonString
        .replace(/```(json)?|```/g, "")
        .replace(/\/\/.*$/gm, "") // コメント行を削除
        .replace(/\/\*[\s\S]*?\*\//g, "") // 複数行コメントを削除
        .replace(/,(\s*[}\]])/g, "$1") // 末尾のカンマを修正
        .trim();
      return JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON解析エラー:", parseError);
      throw new Error("学習計画の生成に失敗しました");
    }
  } catch (error) {
    console.error("Gemini APIエラー:", error);
    throw new Error("学習計画の生成に失敗しました");
  }
}
