"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppShell } from "@/components/shell";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { api } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  projectType: z.string().min(1),
  stage: z.string().min(1),
  deliveryModel: z.string().min(1),
  businessCriticality: z.string().min(1)
});
type FormData = z.infer<typeof schema>;

export default function NewProjectPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", projectType: "SaaS", stage: "MVP", deliveryModel: "Agile", businessCriticality: "high" }
  });

  async function onSubmit(values: FormData) {
    const data = await api<{ project: { id: string } }>("/projects", { method: "POST", body: JSON.stringify(values) });
    router.push(`/projects/${data.project.id}`);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Новый проект</h1>
        <p className="text-sm text-muted">Опишите контекст проекта перед оценкой рисков.</p>
      </div>
      <Card className="max-w-3xl">
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Название" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Описание" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Тип проекта"><Input {...form.register("projectType")} /></Field>
            <Field label="Стадия"><Select {...form.register("stage")}><option>MVP</option><option>Исследование</option><option>Масштабирование</option><option>Модернизация</option></Select></Field>
            <Field label="Модель работы"><Select {...form.register("deliveryModel")}><option>Agile</option><option>Фиксированный объем</option><option>Гибридная</option><option>Расширение команды</option></Select></Field>
            <Field label="Критичность для бизнеса"><Select {...form.register("businessCriticality")}><option value="low">Низкая</option><option value="medium">Средняя</option><option value="high">Высокая</option><option value="critical">Критическая</option></Select></Field>
          </div>
          <Button className="w-fit" disabled={form.formState.isSubmitting}><Save className="h-4 w-4" />Создать проект</Button>
        </form>
      </Card>
    </AppShell>
  );
}
