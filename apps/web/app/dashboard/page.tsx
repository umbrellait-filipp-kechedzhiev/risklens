"use client";

import { PlusCircle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card } from "@/components/ui";
import { api, type ProjectListItem } from "@/lib/api";
import { labelFor } from "@/lib/labels";
import { levelClass } from "@/lib/utils";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    api<{ projects: ProjectListItem[] }>("/projects")
      .then((data) => setProjects(data.projects))
      .catch(() => (window.location.href = "/login"));
  }, []);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Проекты</h1>
          <p className="text-sm text-muted">Оценка риска, статус ревью и следующие действия.</p>
        </div>
        <Link href="/projects/new">
          <Button><PlusCircle className="h-4 w-4" />Новый проект</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link className="text-lg font-semibold hover:text-primary" href={`/projects/${project.id}`}>{project.name}</Link>
                <p className="mt-1 max-w-3xl text-sm text-muted">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span>{project.projectType}</span><span>{project.stage}</span><span>{project.deliveryModel}</span>
                </div>
              </div>
              <div className="min-w-48 text-right">
                {project.latestReview ? (
                  <>
                    <div className="text-2xl font-bold">{Math.round(project.latestReview.overallScore ?? 0)}/100</div>
                    <Badge className={levelClass(project.latestReview.riskLevel)}>{labelFor(project.latestReview.riskLevel ?? "low")}</Badge>
                    <div className="mt-2 text-xs text-muted">{new Date(project.latestReview.createdAt).toLocaleDateString()}</div>
                  </>
                ) : (
                  <Badge className="border-slate-200 bg-slate-100 text-slate-700">Нет оценки</Badge>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/projects/${project.id}/reviews/new`}><Button variant="secondary"><ShieldAlert className="h-4 w-4" />Новая оценка рисков</Button></Link>
              {project.latestReview ? <Link href={`/reviews/${project.latestReview.id}/report`}><Button variant="ghost">Открыть отчет</Button></Link> : null}
            </div>
          </Card>
        ))}
        {projects.length === 0 ? <Card className="text-sm text-muted">Проектов пока нет. Создайте первый проект, чтобы начать оценку.</Card> : null}
      </div>
    </AppShell>
  );
}
