"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, setSession } from "@/lib/api";
import { BrandHeader } from "@/components/shell";
import { Button, Card, Field, Input } from "@/components/ui";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: FormData) {
    try {
      const session = await api<any>("/auth/login", { method: "POST", body: JSON.stringify(values) });
      setSession(session);
      router.push("/dashboard");
    } catch (error) {
      form.setError("root", { message: error instanceof Error ? error.message : "Не удалось войти" });
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <BrandHeader />
      <div className="grid min-h-[calc(100vh-6rem)] place-items-center p-5">
        <Card className="w-full max-w-md">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Eye className="h-5 w-5 text-primary" />
              RiskLens
            </div>
            <p className="mt-2 text-sm text-muted">Войдите, чтобы продолжить оценку рисков.</p>
          </div>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Field label="Эл. почта" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Пароль" error={form.formState.errors.password?.message}>
              <Input type="password" {...form.register("password")} />
            </Field>
            {form.formState.errors.root ? <p className="text-sm text-red-700">{form.formState.errors.root.message}</p> : null}
            <Button disabled={form.formState.isSubmitting}>
              <LogIn className="h-4 w-4" />
              {form.formState.isSubmitting ? "Входим..." : "Войти"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted">
            Нет аккаунта? <Link className="font-medium text-primary" href="/register">Создать</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
