import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { title, description, targetDate, userId } = await request.json();

    // デバッグログを追加
    console.log("Session user ID:", session.user.id);
    console.log("Request user ID:", userId);

    // ユーザーIDがundefinedまたは空文字の場合はセッションのIDを使用
    const actualUserId = userId || session.user.id;

    // ユーザーが存在するか確認し、存在しない場合は作成
    const user = await prisma.user.findUnique({
      where: { id: actualUserId },
    });

    if (!user) {
      // ユーザーが存在しない場合、ユーザーを作成
      await prisma.user.create({
        data: {
          id: actualUserId,
          email: session.user.email || "",
          name: session.user.name || null,
          image: session.user.image || null,
        },
      });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        targetDate: new Date(targetDate),
        userId: actualUserId,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "目標の作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "目標の取得に失敗しました" },
      { status: 500 }
    );
  }
}
