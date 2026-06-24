"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, setSession } from "@/lib/api";
import { Button, Card, Field, Input } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });

  async function onSubmit(values: FormData) {
    const session = await api<any>("/auth/register", { method: "POST", body: JSON.stringify(values) });
    setSession(session);
    router.push("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Создать аккаунт RiskLens</h1>
          <p className="mt-2 text-sm text-muted">Рабочее пространство будет создано автоматически.</p>
        </div>
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Имя" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </Field>
          <Field label="Эл. почта" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} />
          </Field>
          <Field label="Пароль" error={form.formState.errors.password?.message}>
            <Input type="password" {...form.register("password")} />
          </Field>
          <Button disabled={form.formState.isSubmitting}>
            <UserPlus className="h-4 w-4" />
            Зарегистрироваться
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Уже зарегистрированы? <Link className="font-medium text-primary" href="/login">Войти</Link>
        </p>
      </Card>
    </main>
  );
}
