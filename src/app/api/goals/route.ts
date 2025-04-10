import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";
import { generateStudyPlan } from "@/lib/gemini";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { title, field, goal, deadline, daysPerWeek, hoursPerDay } = body;

    // バリデーション
    if (
      !title ||
      !field ||
      !goal ||
      !deadline ||
      !daysPerWeek ||
      !hoursPerDay
    ) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    // 学習目標を作成
    const studyGoal = await prisma.studyGoal.create({
      data: {
        userId: user.id,
        title,
        field,
        goal,
        deadline: new Date(deadline),
        daysPerWeek,
        hoursPerDay,
      },
    });

    // AIで学習計画を生成
    try {
      const studyPlan = await generateStudyPlan(
        field,
        goal,
        new Date(deadline),
        daysPerWeek,
        hoursPerDay
      );

      // スケジュールとタスクを作成
      if (studyPlan && studyPlan.dailyTasks) {
        for (const day of studyPlan.dailyTasks) {
          // スケジュールを作成
          const schedule = await prisma.studySchedule.create({
            data: {
              goalId: studyGoal.id,
              date: new Date(day.date),
              isComplete: false,
              progress: 0,
            },
          });

          // タスクを作成
          for (const task of day.tasks) {
            await prisma.studyTask.create({
              data: {
                goalId: studyGoal.id,
                scheduleId: schedule.id,
                title: task.title,
                description: task.description,
                isComplete: false,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("AIによる計画生成エラー:", error);
      // エラーが発生しても学習目標は作成済みなので、
      // ユーザーには通知するがエラーとしては返さない
      return NextResponse.json(
        {
          message:
            "学習目標は作成されましたが、AIによる計画生成に失敗しました。後で再試行してください。",
          studyGoal,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "学習目標が作成されました", studyGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const studyGoals = await prisma.studyGoal.findMany({
      where: {
        userId: user.id,
      },
      include: {
        studySchedules: {
          include: {
            studyTasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(studyGoals);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const url = new URL(req.url);
    const goalId = url.searchParams.get("goalId");

    if (!goalId) {
      return NextResponse.json({ error: "目標IDが必要です" }, { status: 400 });
    }

    // 目標が本当にユーザーのものかを確認
    const goal = await prisma.studyGoal.findFirst({
      where: {
        id: goalId,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "目標が見つかりません" },
        { status: 404 }
      );
    }

    // 関連するすべてのデータを削除（カスケード削除）
    // 目標を削除すると、関連するスケジュールとタスクも自動的に削除される
    await prisma.studyGoal.delete({
      where: {
        id: goalId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
