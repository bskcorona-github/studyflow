import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import Navbar from "@/components/Navbar";
import GoalForm from "@/components/GoalForm";

export default async function NewGoal() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            新しい学習目標を作成
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            学習目標と期限を設定すると、AIが自動的に学習スケジュールを生成します。
          </p>
        </div>
        <div className="mt-8">
          <GoalForm userId={session.user.id} />
        </div>
      </main>
    </div>
  );
}
