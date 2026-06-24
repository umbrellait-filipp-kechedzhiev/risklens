"use client";

import type { Risk, RiskReport } from "@risklens/shared";
import { Download, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { categoryLabels, labelFor } from "@/lib/labels";
import { levelClass } from "@/lib/utils";

export default function ReportPage() {
  const { reviewId } = useParams<{ reviewId: string }>();
  const [report, setReport] = useState<RiskReport | null>(null);
  const [selected, setSelected] = useState<Risk | null>(null);
  const [exported, setExported] = useState("");

  useEffect(() => {
    api<RiskReport>(`/reviews/${reviewId}/report`).then(setReport);
  }, [reviewId]);

  const risks = useMemo(() => (report ? Object.values(report.risksByCategory).flat() : []), [report]);

  async function exportMarkdown() {
    const data = await api<{ exportId: string; content: string }>(`/reviews/${reviewId}/export`, {
      method: "POST",
      body: JSON.stringify({ format: "markdown", sections: ["executive_summary", "risk_register", "mitigation_plan", "risk_details"] })
    });
    setExported(data.content);
  }

  if (!report) {
    return <AppShell><Card>Загрузка отчета...</Card></AppShell>;
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{report.project.name}</h1>
          <p className="text-sm text-muted">Отчет об оценке рисков</p>
        </div>
        <Button onClick={exportMarkdown}><Download className="h-4 w-4" />Экспорт Markdown</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <p className="text-sm text-muted">Общая оценка риска</p>
          <div className="mt-2 text-5xl font-bold">{report.overallScore}</div>
          <Badge className={levelClass(report.riskLevel)}>{labelFor(report.riskLevel)}</Badge>
          <p className="mt-4 text-sm leading-6 text-muted">{report.executiveSummary}</p>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Матрица рисков</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="probability" type="number" name="Вероятность" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <YAxis dataKey="impact" type="number" name="Влияние" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={risks} fill="#0f766e" onClick={(point: unknown) => setSelected(point as Risk)} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="mb-4 font-semibold">Реестр рисков</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border"><th className="py-2">Риск</th><th>Категория</th><th>Уровень</th><th>Балл</th><th>Владелец</th></tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id} className="cursor-pointer border-b border-border hover:bg-slate-50" onClick={() => setSelected(risk)}>
                    <td className="py-3 font-medium">{risk.name}</td>
                    <td>{categoryLabels[risk.category] ?? risk.category}</td>
                    <td><Badge className={levelClass(risk.level)}>{labelFor(risk.level)}</Badge></td>
                    <td>{risk.score}</td>
                    <td>{risk.ownerSuggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">План действий</h2>
          <div className="grid gap-3">
            {report.actionPlan.map((item) => (
              <div key={item.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2"><h3 className="font-medium">{item.title}</h3><Badge className={levelClass(item.priority)}>{labelFor(item.priority)}</Badge></div>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
                <p className="mt-2 text-xs text-muted">{item.ownerSuggestion} · {item.dueInDays} дн.</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {exported ? <Card className="mt-4"><h2 className="mb-3 font-semibold">Экспорт Markdown</h2><textarea className="h-72 w-full rounded-md border border-border p-3 font-mono text-xs" value={exported} readOnly /></Card> : null}
      {selected ? (
        <div className="fixed inset-0 z-20 bg-black/25" onClick={() => setSelected(null)}>
          <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold">{selected.name}</h2><Badge className={levelClass(selected.level)}>{labelFor(selected.level)} · {selected.score}</Badge></div>
              <Button variant="ghost" onClick={() => setSelected(null)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid gap-4 text-sm leading-6">
              <p>{selected.description}</p>
              <p><strong>Причина:</strong> {selected.cause}</p>
              <p><strong>Последствие:</strong> {selected.consequence}</p>
              <p><strong>Оценка:</strong> вероятность {selected.probability}, влияние {selected.impact}, срочность {selected.urgency}</p>
              <div><strong>Снижение риска:</strong><ul className="mt-2 list-disc pl-5">{selected.mitigation.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <p><strong>План на случай реализации:</strong> {selected.contingency}</p>
              <div><strong>Ранние сигналы:</strong><ul className="mt-2 list-disc pl-5">{selected.earlyWarningSignals.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <p><strong>Рекомендуемый владелец:</strong> {selected.ownerSuggestion}</p>
            </div>
          </aside>
        </div>
      ) : null}
    </AppShell>
  );
}
