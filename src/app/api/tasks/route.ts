import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";

const prisma = new PrismaClient();

// タスク完了状態を更新
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, isComplete, title, description } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "タスクIDが必要です" },
        { status: 400 }
      );
    }

    // タスク取得 (ユーザーのタスクかどうか確認)
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyGoal: {
          userId: user.id,
        },
      },
      include: {
        schedule: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 }
      );
    }

    // 更新するデータの準備
    const updateData: any = {};

    // 完了状態の更新がある場合
    if (isComplete !== undefined) {
      updateData.isComplete = isComplete;
    }

    // タイトルの更新がある場合
    if (title !== undefined) {
      updateData.title = title;
    }

    // 説明の更新がある場合
    if (description !== undefined) {
      updateData.description = description;
    }

    // タスク更新
    const updatedTask = await prisma.studyTask.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

    // 完了状態が変更された場合のみスケジュールの進捗率を更新
    if (isComplete !== undefined) {
      // スケジュールの進捗率を更新
      const allTasks = await prisma.studyTask.findMany({
        where: {
          scheduleId: task.scheduleId,
        },
      });

      const completedTasksCount = allTasks.filter((t) => t.isComplete).length;
      const progress =
        allTasks.length > 0 ? completedTasksCount / allTasks.length : 0;

      // スケジュールが100%完了した場合、完了フラグを立てる
      const isScheduleComplete = progress === 1;

      await prisma.studySchedule.update({
        where: {
          id: task.scheduleId,
        },
        data: {
          progress,
          isComplete: isScheduleComplete,
        },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスク一覧取得
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const goalId = url.searchParams.get("goalId");

    let whereClause: any = {
      studyGoal: {
        userId: user.id,
      },
    };

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(targetDate.getDate() + 1);

      whereClause.schedule = {
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      };
    }

    if (goalId) {
      whereClause.goalId = goalId;
    }

    const tasks = await prisma.studyTask.findMany({
      where: whereClause,
      include: {
        studyGoal: {
          select: {
            title: true,
            field: true,
          },
        },
        schedule: {
          select: {
            date: true,
            isComplete: true,
            progress: true,
          },
        },
      },
      orderBy: [
        {
          schedule: {
            date: "asc",
          },
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

// タスク削除
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "タスクIDが必要です" },
        { status: 400 }
      );
    }

    // タスク取得 (ユーザーのタスクかどうか確認)
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyGoal: {
          userId: user.id,
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "タスクが見つかりません" },
        { status: 404 }
      );
    }

    // タスク削除
    await prisma.studyTask.delete({
      where: {
        id: taskId,
      },
    });

    // スケジュールの進捗率を更新
    const allTasks = await prisma.studyTask.findMany({
      where: {
        scheduleId: task.scheduleId,
      },
    });

    const completedTasksCount = allTasks.filter((t) => t.isComplete).length;
    const progress =
      allTasks.length > 0 ? completedTasksCount / allTasks.length : 0;

    await prisma.studySchedule.update({
      where: {
        id: task.scheduleId,
      },
      data: {
        progress,
        isComplete: allTasks.length === 0 || progress === 1,
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
