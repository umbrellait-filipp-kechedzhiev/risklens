"use client";

import { BarChart3, FolderKanban, LogOut, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/api";
import { Button } from "./ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = getSession();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-white p-4 md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold">
          <BarChart3 className="h-5 w-5 text-primary" />
          RiskLens
        </Link>
        <nav className="mt-8 grid gap-2">
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100" href="/dashboard">
            <FolderKanban className="h-4 w-4" />
            Проекты
          </Link>
          <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100" href="/projects/new">
            <PlusCircle className="h-4 w-4" />
            Новый проект
          </Link>
        </nav>
        <div className="mt-8 border-t border-border pt-4 text-sm text-muted">
          <div className="truncate">{session?.user.name}</div>
          <div className="truncate">{session?.user.email}</div>
          <Button
            className="mt-3 w-full"
            variant="secondary"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Button>
        </div>
      </aside>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
