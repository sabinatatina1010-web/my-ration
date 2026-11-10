import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { auth } from "@/lib/auth";
import { getDashboardSummary } from "@/modules/dashboard/service";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const summary = await getDashboardSummary(session.user.id);

  if (!summary) {
    redirect("/profile/onboarding");
  }

  return (
    <DashboardView userName={session.user.name} summary={summary} />
  );
}
