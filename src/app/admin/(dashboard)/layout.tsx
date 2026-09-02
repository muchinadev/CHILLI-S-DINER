import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/lib/services/auth-service";
import { BottomNav } from "@/components/admin/BottomNav";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-stone-500">Signed in as</p>
            <p className="text-sm font-semibold text-stone-900">{session.name}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-medium text-stone-500 hover:text-stone-800">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
