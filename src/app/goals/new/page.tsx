import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import NewGoalForm from "@/components/NewGoalForm";

export default async function NewGoal() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">新しい学習目標</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <NewGoalForm userId={user.id} />
      </div>
    </div>
  );
}
