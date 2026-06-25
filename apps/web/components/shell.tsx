"use client";

import { FolderKanban, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/api";
import { Button } from "./ui";

export function BrandHeader() {
  return (
    <header className="flex h-24 items-center justify-between bg-black px-5 md:px-9">
      <Link href="/dashboard" className="flex items-center" aria-label="Umbrella IT RiskLens">
        <img className="h-12 w-auto" src="/umbrellait-logo.svg" alt="Umbrella IT" />
      </Link>
      <div className="text-right">
        <div className="text-base font-bold text-white">RiskLens</div>
        <div className="text-xs text-white/65">Project risk intelligence</div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = getSession();
  return (
    <div className="min-h-screen bg-background">
      <BrandHeader />
      <div className="md:grid md:grid-cols-[280px_1fr]">
        <aside className="border-b border-border bg-primary p-5 text-white md:min-h-[calc(100vh-6rem)] md:border-b-0">
          <Link href="/dashboard" className="flex items-center gap-3 text-2xl font-bold">
            <ShieldCheck className="h-7 w-7" />
            RiskLens
          </Link>
          <p className="mt-1 text-sm text-white/70">by Umbrella IT</p>
          <nav className="mt-10 grid gap-2">
            <Link className="flex items-center gap-2 rounded-lg bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/20" href="/dashboard">
              <FolderKanban className="h-4 w-4" />
              Проекты
            </Link>
            <Link className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-white/80 hover:bg-white/15 hover:text-white" href="/projects/new">
              <PlusCircle className="h-4 w-4" />
              Новый проект
            </Link>
          </nav>
          <div className="mt-10 border-t border-white/20 pt-5 text-sm text-white/70">
            <div className="truncate font-semibold text-white">{session?.user.name}</div>
            <div className="truncate">{session?.user.email}</div>
            <Button
              className="mt-4 w-full"
              variant="inverse"
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
    </div>
  );
}
