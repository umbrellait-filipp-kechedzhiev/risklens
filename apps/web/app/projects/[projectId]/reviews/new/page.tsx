"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppShell } from "@/components/shell";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { labelFor } from "@/lib/labels";

const schema = z.object({
  requirementsMaturity: z.enum(["not_defined", "partially_defined", "mostly_defined", "fully_defined"]),
  mvpScopeFixed: z.boolean(),
  stakeholdersInfluencingRequirements: z.coerce.number().int().min(0).max(20),
  requirementChanges: z.enum(["rarely", "sometimes", "often", "very_often"]),
  acceptanceCriteria: z.enum(["no", "partially", "mostly", "yes"]),
  changeRequestProcess: z.boolean(),
  deadlineRigidity: z.enum(["flexible", "somewhat_flexible", "fixed", "immovable"]),
  timeUntilDeadline: z.enum(["less_than_1_month", "one_to_three_months", "three_to_six_months", "more_than_six_months"]),
  scheduleBuffer: z.enum(["none", "small", "moderate", "large"]),
  budgetFlexibility: z.enum(["flexible", "limited", "fixed", "unknown"]),
  teamSize: z.coerce.number().int().min(1).max(200),
  teamDomainExperience: z.enum(["none", "low", "medium", "high"]),
  teamTechnologyExperience: z.enum(["none", "low", "medium", "high"]),
  keyPeopleShared: z.boolean(),
  dedicatedQa: z.boolean(),
  technicalLead: z.boolean(),
  technicalComplexity: z.enum(["low", "medium", "high", "very_high"]),
  newTechnology: z.boolean(),
  legacySystem: z.boolean(),
  externalApi: z.boolean(),
  dataMigration: z.boolean(),
  securityCompliance: z.boolean(),
  performanceCritical: z.boolean(),
  keyStakeholdersCount: z.coerce.number().int().min(1).max(50),
  singleDecisionMaker: z.boolean(),
  externalVendors: z.boolean(),
  dependenciesOnOtherTeams: z.boolean(),
  clientResponseSpeed: z.enum(["fast", "normal", "slow", "unpredictable"]),
  communicationClarity: z.enum(["clear", "mostly_clear", "unclear", "chaotic"])
});
type FormData = z.infer<typeof schema>;

const steps = ["Объем", "Сроки", "Команда", "Технологии", "Стейкхолдеры", "Генерация"];
const opts = (values: string[]) => values.map((value) => <option key={value} value={value}>{labelFor(value)}</option>);
const checkboxLabels: Record<string, string> = {
  newTechnology: "Новая технология",
  legacySystem: "Наследуемая система",
  externalApi: "Внешний API",
  dataMigration: "Миграция данных",
  securityCompliance: "Требования безопасности или соответствия",
  performanceCritical: "Критична производительность"
};

export default function NewReviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requirementsMaturity: "partially_defined",
      mvpScopeFixed: true,
      stakeholdersInfluencingRequirements: 4,
      requirementChanges: "sometimes",
      acceptanceCriteria: "partially",
      changeRequestProcess: false,
      deadlineRigidity: "fixed",
      timeUntilDeadline: "one_to_three_months",
      scheduleBuffer: "small",
      budgetFlexibility: "limited",
      teamSize: 6,
      teamDomainExperience: "medium",
      teamTechnologyExperience: "medium",
      keyPeopleShared: true,
      dedicatedQa: true,
      technicalLead: true,
      technicalComplexity: "high",
      newTechnology: false,
      legacySystem: false,
      externalApi: true,
      dataMigration: false,
      securityCompliance: true,
      performanceCritical: true,
      keyStakeholdersCount: 5,
      singleDecisionMaker: false,
      externalVendors: false,
      dependenciesOnOtherTeams: true,
      clientResponseSpeed: "normal",
      communicationClarity: "mostly_clear"
    }
  });

  async function onSubmit(values: FormData) {
    const created = await api<{ review: { id: string } }>(`/projects/${projectId}/reviews`, { method: "POST", body: JSON.stringify({}) });
    await api(`/reviews/${created.review.id}/answers`, { method: "PATCH", body: JSON.stringify(values) });
    await api(`/reviews/${created.review.id}/generate`, { method: "POST", body: JSON.stringify({}) });
    router.push(`/reviews/${created.review.id}/report`);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Новая оценка рисков</h1>
        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
          {steps.map((label, index) => (
            <button key={label} type="button" onClick={() => setStep(index)} className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-slate-200"}`} aria-label={label} />
          ))}
        </div>
        <p className="mt-2 text-sm font-medium">{steps[step]}</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-5xl">
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Зрелость требований"><Select {...form.register("requirementsMaturity")}>{opts(["not_defined", "partially_defined", "mostly_defined", "fully_defined"])}</Select></Field>
              <Field label="Изменения требований"><Select {...form.register("requirementChanges")}>{opts(["rarely", "sometimes", "often", "very_often"])}</Select></Field>
              <Field label="Стейкхолдеры, влияющие на требования"><Input type="number" {...form.register("stakeholdersInfluencingRequirements")} /></Field>
              <Field label="Критерии приемки"><Select {...form.register("acceptanceCriteria")}>{opts(["no", "partially", "mostly", "yes"])}</Select></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("mvpScopeFixed")} /> Объем MVP зафиксирован</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("changeRequestProcess")} /> Есть процесс управления изменениями</label>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Жесткость дедлайна"><Select {...form.register("deadlineRigidity")}>{opts(["flexible", "somewhat_flexible", "fixed", "immovable"])}</Select></Field>
              <Field label="Время до дедлайна"><Select {...form.register("timeUntilDeadline")}>{opts(["less_than_1_month", "one_to_three_months", "three_to_six_months", "more_than_six_months"])}</Select></Field>
              <Field label="Буфер в графике"><Select {...form.register("scheduleBuffer")}>{opts(["none", "small", "moderate", "large"])}</Select></Field>
              <Field label="Гибкость бюджета"><Select {...form.register("budgetFlexibility")}>{opts(["flexible", "limited", "fixed", "unknown"])}</Select></Field>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Размер команды"><Input type="number" {...form.register("teamSize")} /></Field>
              <Field label="Опыт в предметной области"><Select {...form.register("teamDomainExperience")}>{opts(["none", "low", "medium", "high"])}</Select></Field>
              <Field label="Технологический опыт"><Select {...form.register("teamTechnologyExperience")}>{opts(["none", "low", "medium", "high"])}</Select></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("keyPeopleShared")} /> Ключевые специалисты разделены между проектами</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("dedicatedQa")} /> Есть выделенное тестирование</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("technicalLead")} /> Есть технический лидер</label>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Техническая сложность"><Select {...form.register("technicalComplexity")}>{opts(["low", "medium", "high", "very_high"])}</Select></Field>
              {(["newTechnology", "legacySystem", "externalApi", "dataMigration", "securityCompliance", "performanceCritical"] as const).map((field) => (
                <label key={field} className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register(field)} /> {checkboxLabels[field]}</label>
              ))}
            </div>
          ) : null}
          {step === 4 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Количество ключевых стейкхолдеров"><Input type="number" {...form.register("keyStakeholdersCount")} /></Field>
              <Field label="Скорость ответа клиента"><Select {...form.register("clientResponseSpeed")}>{opts(["fast", "normal", "slow", "unpredictable"])}</Select></Field>
              <Field label="Ясность коммуникации"><Select {...form.register("communicationClarity")}>{opts(["clear", "mostly_clear", "unclear", "chaotic"])}</Select></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("singleDecisionMaker")} /> Есть единый принимающий решение</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("externalVendors")} /> Есть внешние подрядчики</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("dependenciesOnOtherTeams")} /> Есть зависимости от других команд</label>
            </div>
          ) : null}
          {step === 5 ? (
            <div>
              <h2 className="text-lg font-semibold">Готово к формированию</h2>
              <p className="mt-2 text-sm text-muted">RiskLens сохранит ответы, запустит правило оценки рисков и создаст отчет.</p>
            </div>
          ) : null}
          <div className="mt-6 flex justify-between border-t border-border pt-4">
            <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ArrowLeft className="h-4 w-4" />Назад</Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => setStep((value) => value + 1)}>Далее<ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button disabled={form.formState.isSubmitting}><Wand2 className="h-4 w-4" />Сформировать отчет</Button>
            )}
          </div>
        </Card>
      </form>
    </AppShell>
  );
}
