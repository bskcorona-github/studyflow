import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const goalId = params.id;

    // 目標が存在するか確認
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "目標が見つかりません" },
        { status: 404 }
      );
    }

    // 目標の所有者確認
    if (goal.userId !== session.user.id) {
      return NextResponse.json(
        { error: "この操作を実行する権限がありません" },
        { status: 403 }
      );
    }

    // 目標を削除（関連するタスクはonDeleteのCascadeで自動的に削除されます）
    // プリズマスキーマでonDelete: Cascadeが設定されているので、goalを削除すると関連するdailyStudyも削除される
    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "目標の削除に失敗しました" },
      { status: 500 }
    );
  }
}
