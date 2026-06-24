import type { FastifyInstance } from "fastify";
import type { ActionItem, Project, Risk, RiskAssessmentAnswers, RiskCategory, RiskLevel, RiskReview } from "@risklens/shared";
import { authenticate } from "./auth.js";
import { prisma } from "./prisma.js";
import { RiskEngineService } from "./risk-engine.js";
import { answersSchema, exportSchema, projectSchema } from "./schemas.js";

const engine = new RiskEngineService();
const categories: RiskCategory[] = [
  "scope",
  "timeline",
  "team",
  "technical",
  "dependency",
  "stakeholder",
  "quality",
  "release",
  "compliance",
  "data",
  "performance",
  "budget"
];

const levelLabels: Record<string, string> = {
  low: "низкий",
  medium: "средний",
  high: "высокий",
  critical: "критический"
};

const categoryLabels: Record<string, string> = {
  scope: "объем работ",
  timeline: "сроки",
  team: "команда",
  technical: "технологии",
  dependency: "зависимости",
  stakeholder: "стейкхолдеры",
  quality: "качество",
  release: "релиз",
  compliance: "безопасность и соответствие",
  data: "данные",
  performance: "производительность",
  budget: "бюджет"
};

const toProject = (project: any): Project => ({
  ...project,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString()
});

const toReview = (review: any): RiskReview => ({
  id: review.id,
  projectId: review.projectId,
  status: review.status,
  overallScore: review.overallScore,
  riskLevel: review.riskLevel,
  executiveSummary: review.executiveSummary,
  createdAt: review.createdAt.toISOString(),
  updatedAt: review.updatedAt.toISOString()
});

const toRisk = (risk: any): Risk => ({
  id: risk.id,
  reviewId: risk.reviewId,
  name: risk.name,
  category: risk.category,
  description: risk.description,
  cause: risk.cause,
  consequence: risk.consequence,
  probability: risk.probability,
  impact: risk.impact,
  urgency: risk.urgency,
  score: risk.score,
  level: risk.level,
  confidence: risk.confidence,
  mitigation: risk.mitigation,
  contingency: risk.contingency,
  earlyWarningSignals: risk.earlyWarningSignals,
  ownerSuggestion: risk.ownerSuggestion,
  status: risk.status
});

const toAction = (item: any): ActionItem => ({
  id: item.id,
  reviewId: item.reviewId,
  title: item.title,
  description: item.description,
  ownerSuggestion: item.ownerSuggestion,
  priority: item.priority,
  dueInDays: item.dueInDays
});

async function assertProjectAccess(projectId: string, workspaceId: string) {
  return prisma.project.findFirst({ where: { id: projectId, workspaceId } });
}

async function assertReviewAccess(reviewId: string, workspaceId: string) {
  return prisma.riskReview.findFirst({
    where: { id: reviewId, project: { workspaceId } },
    include: { project: true }
  });
}

async function buildReport(reviewId: string, workspaceId: string) {
  const review = await assertReviewAccess(reviewId, workspaceId);
  if (!review) return null;
  const [risksRaw, actionsRaw] = await Promise.all([
    prisma.risk.findMany({ where: { reviewId }, orderBy: { score: "desc" } }),
    prisma.actionItem.findMany({ where: { reviewId }, orderBy: { dueInDays: "asc" } })
  ]);
  const risks: Risk[] = risksRaw.map(toRisk);
  const risksByCategory = Object.fromEntries(categories.map((category) => [category, risks.filter((risk: Risk) => risk.category === category)])) as Record<
    RiskCategory,
    Risk[]
  >;
  return {
    project: toProject(review.project),
    review: toReview(review),
    overallScore: Math.round(review.overallScore ?? 0),
    riskLevel: (review.riskLevel ?? "low") as RiskLevel,
    executiveSummary: review.executiveSummary ?? "",
    topRisks: risks.slice(0, 5),
    risksByCategory,
    actionPlan: actionsRaw.map(toAction),
    risks
  };
}

function markdownReport(report: Awaited<ReturnType<typeof buildReport>>, sections: string[]) {
  if (!report) return "";
  const lines = [`# Отчет об оценке рисков: ${report.project.name}`, "", `Общая оценка: **${report.overallScore}/100**`, `Уровень риска: **${levelLabels[report.riskLevel]}**`, ""];
  if (sections.includes("executive_summary")) {
    lines.push("## Резюме", report.executiveSummary, "");
  }
  if (sections.includes("risk_register")) {
    lines.push("## Реестр рисков", "", "| Риск | Категория | Уровень | Балл | Владелец |", "| --- | --- | --- | ---: | --- |");
    for (const risk of report.risks) {
      lines.push(`| ${risk.name} | ${categoryLabels[risk.category]} | ${levelLabels[risk.level]} | ${risk.score} | ${risk.ownerSuggestion} |`);
    }
    lines.push("");
  }
  if (sections.includes("mitigation_plan")) {
    lines.push("## План снижения рисков", "");
    for (const item of report.actionPlan) {
      lines.push(`- **${item.title}** (${levelLabels[item.priority]}, ${item.dueInDays} дн.): ${item.description} Владелец: ${item.ownerSuggestion}.`);
    }
    lines.push("");
  }
  if (sections.includes("risk_details")) {
    lines.push("## Детали рисков", "");
    for (const risk of report.risks) {
      lines.push(`### ${risk.name}`, risk.description, `Причина: ${risk.cause}`, `Последствие: ${risk.consequence}`, `План на случай реализации: ${risk.contingency}`, "");
    }
  }
  return lines.join("\n");
}

export async function appRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/workspaces/current", async (request) => {
    const workspace = await prisma.workspace.findUnique({ where: { id: request.user.workspaceId } });
    return { workspace };
  });

  app.post("/projects", async (request) => {
    const body = projectSchema.parse(request.body);
    const project = await prisma.project.create({ data: { ...body, workspaceId: request.user.workspaceId } });
    return { project: toProject(project) };
  });

  app.get("/projects", async (request) => {
    const projects = await prisma.project.findMany({
      where: { workspaceId: request.user.workspaceId },
      include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" }
    });
    return {
      projects: projects.map((project: any) => ({
        ...toProject(project),
        latestReview: project.reviews[0] ? toReview(project.reviews[0]) : null
      }))
    };
  });

  app.get("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await assertProjectAccess(id, request.user.workspaceId);
    if (!project) return reply.code(404).send({ message: "Проект не найден" });
    return { project: toProject(project) };
  });

  app.patch("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const access = await assertProjectAccess(id, request.user.workspaceId);
    if (!access) return reply.code(404).send({ message: "Проект не найден" });
    const body = projectSchema.partial().parse(request.body);
    const project = await prisma.project.update({ where: { id }, data: body });
    return { project: toProject(project) };
  });

  app.delete("/projects/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const access = await assertProjectAccess(id, request.user.workspaceId);
    if (!access) return reply.code(404).send({ message: "Проект не найден" });
    await prisma.project.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/projects/:projectId/reviews", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = await assertProjectAccess(projectId, request.user.workspaceId);
    if (!project) return reply.code(404).send({ message: "Проект не найден" });
    const review = await prisma.riskReview.create({ data: { projectId } });
    return { review: toReview(review) };
  });

  app.get("/projects/:projectId/reviews", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const project = await assertProjectAccess(projectId, request.user.workspaceId);
    if (!project) return reply.code(404).send({ message: "Проект не найден" });
    const reviews = await prisma.riskReview.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
    return { reviews: reviews.map(toReview) };
  });

  app.get("/reviews/:reviewId", async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const review = await assertReviewAccess(reviewId, request.user.workspaceId);
    if (!review) return reply.code(404).send({ message: "Оценка не найдена" });
    return { review: toReview(review) };
  });

  app.patch("/reviews/:reviewId/answers", async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const review = await assertReviewAccess(reviewId, request.user.workspaceId);
    if (!review) return reply.code(404).send({ message: "Оценка не найдена" });
    const answers = answersSchema.parse(request.body);
    await prisma.riskAnswer.upsert({
      where: { reviewId },
      create: { reviewId, answers },
      update: { answers }
    });
    return { ok: true };
  });

  app.post("/reviews/:reviewId/generate", async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const review = await assertReviewAccess(reviewId, request.user.workspaceId);
    if (!review) return reply.code(404).send({ message: "Оценка не найдена" });
    const answerRecord = await prisma.riskAnswer.findUnique({ where: { reviewId } });
    if (!answerRecord) return reply.code(400).send({ message: "Нужны ответы для оценки" });

    await prisma.riskReview.update({ where: { id: reviewId }, data: { status: "generating" } });
    const answers = answersSchema.parse(answerRecord.answers) as RiskAssessmentAnswers;
    const generated = engine.generateRisks(toProject(review.project), answers).map((risk) => ({ ...risk, reviewId }));
    const overallScore = engine.calculateOverallScore(generated);
    const riskLevel = engine.calculateRiskLevel(overallScore);
    const executiveSummary = engine.generateExecutiveSummary(toProject(review.project), generated);
    const actions = engine.generateActionPlan(generated);

    await prisma.$transaction([
      prisma.risk.deleteMany({ where: { reviewId } }),
      prisma.actionItem.deleteMany({ where: { reviewId } }),
      prisma.risk.createMany({
        data: generated.map((risk) => ({
          reviewId,
          name: risk.name,
          category: risk.category,
          description: risk.description,
          cause: risk.cause,
          consequence: risk.consequence,
          probability: risk.probability,
          impact: risk.impact,
          urgency: risk.urgency,
          score: risk.score,
          level: risk.level,
          confidence: risk.confidence,
          mitigation: risk.mitigation,
          contingency: risk.contingency,
          earlyWarningSignals: risk.earlyWarningSignals,
          ownerSuggestion: risk.ownerSuggestion,
          status: risk.status
        }))
      }),
      prisma.actionItem.createMany({ data: actions.map(({ id, ...item }) => item) }),
      prisma.riskReview.update({ where: { id: reviewId }, data: { status: "completed", overallScore, riskLevel, executiveSummary } })
    ]);

    return { reviewId, overallScore, riskLevel };
  });

  app.get("/reviews/:reviewId/report", async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const report = await buildReport(reviewId, request.user.workspaceId);
    if (!report) return reply.code(404).send({ message: "Отчет не найден" });
    return report;
  });

  app.post("/reviews/:reviewId/export", async (request, reply) => {
    const { reviewId } = request.params as { reviewId: string };
    const body = exportSchema.parse(request.body);
    const report = await buildReport(reviewId, request.user.workspaceId);
    if (!report) return reply.code(404).send({ message: "Отчет не найден" });
    const content = markdownReport(report, body.sections);
    const created = await prisma.reportExport.create({ data: { reviewId, format: body.format, sections: body.sections, content } });
    return { exportId: created.id, content };
  });

  app.get("/exports/:exportId/download", async (request, reply) => {
    const { exportId } = request.params as { exportId: string };
    const record = await prisma.reportExport.findFirst({
      where: { id: exportId, review: { project: { workspaceId: request.user.workspaceId } } }
    });
    if (!record) return reply.code(404).send({ message: "Экспорт не найден" });
    reply.header("content-type", "text/markdown; charset=utf-8");
    reply.header("content-disposition", `attachment; filename="risklens-${record.id}.md"`);
    return record.content;
  });
}
