"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { labelFor } from "@/lib/labels";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    api<{ project: any }>(`/projects/${projectId}`).then((data) => setProject(data.project));
    api<{ reviews: any[] }>(`/projects/${projectId}/reviews`).then((data) => setReviews(data.reviews));
  }, [projectId]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project?.name ?? "Проект"}</h1>
          <p className="text-sm text-muted">{project?.description}</p>
        </div>
        <Link href={`/projects/${projectId}/reviews/new`}><Button><ShieldAlert className="h-4 w-4" />Новая оценка рисков</Button></Link>
      </div>
      <Card>
        <h2 className="mb-4 font-semibold">Оценки рисков</h2>
        <div className="grid gap-2">
          {reviews.map((review) => (
            <Link key={review.id} className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-slate-50" href={`/reviews/${review.id}/report`}>
              <span>{new Date(review.createdAt).toLocaleString()}</span>
              <span className="text-sm text-muted">{labelFor(review.status)} {review.overallScore ? `· ${Math.round(review.overallScore)}/100` : ""}</span>
            </Link>
          ))}
          {reviews.length === 0 ? <p className="text-sm text-muted">Оценок пока нет.</p> : null}
        </div>
      </Card>
    </AppShell>
  );
}
