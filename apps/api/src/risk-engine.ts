import type { ActionItem, Project, Risk, RiskAssessmentAnswers, RiskCategory, RiskLevel } from "@risklens/shared";

type DraftRisk = Omit<Risk, "id" | "reviewId" | "score" | "level" | "status">;

const levelFromScore = (score: number): RiskLevel => {
  if (score <= 20) return "low";
  if (score <= 45) return "medium";
  if (score <= 75) return "high";
  return "critical";
};

const clamp = (n: number) => Math.max(1, Math.min(5, n));
const exp = (value: string) => ({ none: 5, low: 4, medium: 2, high: 1 })[value] ?? 3;

function draft(
  name: string,
  category: RiskCategory,
  probability: number,
  impact: number,
  urgency: number,
  description: string,
  cause: string,
  consequence: string,
  mitigation: string[],
  contingency: string,
  earlyWarningSignals: string[],
  ownerSuggestion: string,
  confidence: "low" | "medium" | "high" = "high"
): DraftRisk {
  return {
    name,
    category,
    description,
    cause,
    consequence,
    probability: clamp(probability),
    impact: clamp(impact),
    urgency: clamp(urgency),
    confidence,
    mitigation,
    contingency,
    earlyWarningSignals,
    ownerSuggestion
  };
}

export class RiskEngineService {
  generateRisks(project: Project, answers: RiskAssessmentAnswers): Risk[] {
    const risks: DraftRisk[] = [
      draft(
        "Риск разрастания объема",
        "scope",
        2 + (answers.requirementsMaturity === "not_defined" ? 2 : 0) + (answers.requirementChanges === "very_often" ? 1 : 0),
        project.businessCriticality === "critical" ? 5 : 4,
        answers.changeRequestProcess ? 2 : 4,
        "Объем MVP может расшириться в ходе разработки.",
        "Требования еще не полностью стабильны, а влияние стейкхолдеров заметно.",
        "Команда может не уложиться в сроки и бюджет из-за дополнительной работы.",
        ["Зафиксировать результаты MVP", "Создать комитет по управлению изменениями", "Выносить отложенные запросы в отдельный бэклог"],
        "Перейти к поэтапному релизу с явными компромиссами по объему.",
        ["Больше двух запросов на изменение за спринт", "Критерии приемки переписываются на позднем этапе"],
        "Владелец продукта"
      ),
      draft(
        "Риск задержки поставки",
        "timeline",
        answers.deadlineRigidity === "immovable" ? 5 : 3,
        4,
        answers.scheduleBuffer === "none" ? 5 : answers.scheduleBuffer === "small" ? 4 : 2,
        "Команда может не завершить запланированную работу к целевой дате.",
        "Дедлайн ограниченно гибкий, а резерв в графике мал.",
        "Дата запуска сдвигается, что приводит к эскалации или сокращению объема.",
        ["Еженедельно пересматривать вехи", "Убирать некритичные функции", "Добавить явный резерв на критический путь"],
        "Выпустить только основной сценарий, а менее ценные функции перенести.",
        ["Скорость ниже плана", "Блокеры не решаются дольше трех дней"],
        "Проектный менеджер"
      ),
      draft(
        "Риск нехватки ресурсов команды",
        "team",
        1 + exp(answers.teamDomainExperience) + (answers.keyPeopleShared ? 1 : 0),
        4,
        answers.technicalLead ? 2 : 4,
        "Фактическая пропускная способность команды может оказаться ниже плана.",
        "Может не хватать доменной экспертизы, выделенного тестирования или технического лидерства.",
        "Растут дефекты, переделки и невыполненные обязательства.",
        ["Зафиксировать загрузку ключевых специалистов", "Провести onboarding-сессии", "Уточнить техническое лидерство"],
        "Привлечь краткосрочную экспертную поддержку на критичные направления.",
        ["Очереди на ревью растут", "Ключевых участников регулярно переключают"],
        "Руководитель поставки"
      ),
      draft(
        "Риск технической неопределенности",
        "technical",
        answers.technicalComplexity === "very_high" ? 5 : answers.technicalComplexity === "high" ? 4 : 2,
        answers.newTechnology ? 5 : 4,
        answers.legacySystem ? 4 : 3,
        "Неизвестные технические работы могут занять больше времени, чем оценено.",
        "В проекте есть сложная архитектура, новая технология или ограничения legacy-систем.",
        "Архитектурные изменения и исследовательская работа ломают прогноз поставки.",
        ["Провести технические spike-задачи", "Документировать архитектурные решения", "Сначала прототипировать самую рискованную интеграцию"],
        "Заменить неопределенные компоненты проверенными альтернативами.",
        ["Исследовательская задача выходит за таймбокс", "Ключевые нефункциональные требования не проверены"],
        "Технический лидер"
      ),
      draft(
        "Риск внешних зависимостей",
        "dependency",
        answers.externalVendors || answers.dependenciesOnOtherTeams ? 4 : 2,
        4,
        answers.clientResponseSpeed === "unpredictable" ? 5 : 3,
        "Внешние участники могут заблокировать прогресс поставки.",
        "План зависит от подрядчиков, API или других команд.",
        "Проект ждет решений, доступов, договоров или технических поставок.",
        ["Назначить владельцев зависимостей", "Согласовать SLA на ответы", "Подготовить запасные варианты реализации"],
        "Использовать заглушки или моки до готовности зависимостей.",
        ["Подрядчик пропускает даты", "Доступы не выданы больше двух дней"],
        "Проектный менеджер"
      ),
      draft(
        "Риск несогласованности стейкхолдеров",
        "stakeholder",
        answers.keyStakeholdersCount > 5 ? 4 : 2,
        4,
        answers.singleDecisionMaker ? 2 : 4,
        "Стейкхолдеры могут расходиться в приоритетах или критериях приемки.",
        "Права на принятие решений и ясность коммуникации недостаточно сильные.",
        "Команда получает противоречивые указания и тратит время на переделки.",
        ["Назначить финального согласующего", "Проводить еженедельный разбор решений", "Фиксировать компромиссы письменно"],
        "Эскалировать нерешенные вопросы в управляющий комитет.",
        ["Противоречивая обратная связь", "Решения отменяются после планирования спринта"],
        "Спонсор"
      ),
      draft(
        "Риск качества",
        "quality",
        answers.dedicatedQa ? 2 : 4,
        4,
        answers.acceptanceCriteria === "no" ? 5 : 3,
        "Дефекты могут попасть в релиз-кандидаты.",
        "Ресурсы тестирования или критерии приемки неполные.",
        "Пользователи теряют доверие, а релиз требует незапланированной стабилизации.",
        ["Описать критерии приемки", "Автоматизировать дымовые тесты", "Добавить контрольные точки приемки тестированием"],
        "Приостановить разработку функций на стабилизационный спринт.",
        ["Растет доля переоткрытых дефектов", "Истории принимаются без тестов"],
        "Руководитель тестирования"
      ),
      draft(
        "Риск релиза",
        "release",
        answers.timeUntilDeadline === "less_than_1_month" ? 5 : 3,
        4,
        answers.scheduleBuffer === "none" ? 5 : 3,
        "Релиз может не пройти проверку операционной готовности.",
        "Мало времени на стабилизацию, планирование rollout или тестирование rollback.",
        "Запуск в production задерживается или требует срочных исправлений.",
        ["Создать релизный чеклист", "Протестировать rollback", "Провести проверку готовности к production"],
        "Использовать постепенный rollout с feature flags.",
        ["Не назначен владелец релиза", "Путь отката не протестирован"],
        "Релиз-менеджер"
      ),
      draft(
        "Риск безопасности и соответствия",
        "compliance",
        answers.securityCompliance ? 4 : 1,
        project.businessCriticality === "critical" ? 5 : 3,
        answers.securityCompliance ? 4 : 2,
        "Требования безопасности или соответствия могут быть упущены.",
        "Продукт работает с регулируемыми или чувствительными требованиями.",
        "Замечания аудита или проблемы безопасности блокируют запуск.",
        ["Рано определить контрольные меры", "Запланировать security review", "Собирать доказательства в ходе разработки"],
        "Запуститься с сокращенным объемом данных, пока контрольные меры завершаются.",
        ["Проверка безопасности откладывается", "Неясны владельцы контрольных мер"],
        "Владелец безопасности"
      ),
      draft(
        "Риск миграции данных",
        "data",
        answers.dataMigration ? 4 : 1,
        4,
        answers.dataMigration ? 4 : 1,
        "Качество миграции может повлиять на готовность к запуску.",
        "Проект требует переноса или преобразования существующих данных.",
        "Некорректные данные приводят к обращениям в поддержку и давлению на откат.",
        ["Профилировать исходные данные", "Провести тестовые миграции", "Определить проверки сверки"],
        "Сохранить доступ на чтение к legacy-системе на период возможного отката.",
        ["Высокая доля отклонений в тестовых загрузках", "Владение данными не определено"],
        "Руководитель данных"
      ),
      draft(
        "Риск производительности",
        "performance",
        answers.performanceCritical ? 4 : 2,
        answers.performanceCritical ? 5 : 3,
        answers.performanceCritical ? 4 : 2,
        "Система может не выполнить целевые показатели нагрузки или отзывчивости.",
        "Критичные к производительности сценарии не проверены на реалистичном трафике.",
        "Пользовательский опыт ухудшается, а готовность к запуску ставится под вопрос.",
        ["Определить SLO", "Провести нагрузочные тесты критичных сценариев", "Добавить наблюдаемость до запуска"],
        "Временно ограничить использование или отключить дорогие функции.",
        ["P95 latency выше цели", "Нет среды для нагрузочного тестирования"],
        "Технический руководитель"
      ),
      draft(
        "Риск превышения бюджета",
        "budget",
        answers.budgetFlexibility === "fixed" ? 4 : 2,
        4,
        answers.deadlineRigidity === "immovable" ? 4 : 2,
        "Проекту может понадобиться больше бюджета, чем утверждено.",
        "Фиксированный бюджет, давление сроков и неопределенность повышают риск переделок.",
        "Команде придется сокращать объем, запрашивать финансирование или снижать качество.",
        ["Еженедельно отслеживать burn rate", "Согласовывать изменения объема с влиянием на стоимость", "Зарезервировать бюджет на непредвиденное"],
        "Перейти только к must-have объему.",
        ["Фактический burn rate выше прогноза", "В спринт добавлена не профинансированная работа"],
        "Спонсор"
      )
    ];

    return risks.map((risk, index) => {
      const score = risk.probability * risk.impact * risk.urgency;
      return { ...risk, id: `generated_${index + 1}`, reviewId: "", score, level: levelFromScore(score), status: "open" };
    });
  }

  calculateOverallScore(risks: Risk[]) {
    if (risks.length === 0) return 0;
    return Math.round((risks.reduce((sum, risk) => sum + risk.score, 0) / risks.length / 125) * 100);
  }

  calculateRiskLevel(score: number): RiskLevel {
    if (score <= 30) return "low";
    if (score <= 60) return "medium";
    if (score <= 80) return "high";
    return "critical";
  }

  generateActionPlan(risks: Risk[]): ActionItem[] {
    return risks
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((risk, index) => ({
        id: `action_${index + 1}`,
        reviewId: risk.reviewId,
        title: `Снизить: ${risk.name}`,
        description: risk.mitigation[0],
        ownerSuggestion: risk.ownerSuggestion,
        priority: risk.level,
        dueInDays: risk.level === "critical" ? 7 : risk.level === "high" ? 14 : 30
      }));
  }

  generateExecutiveSummary(project: Project, risks: Risk[]) {
    const top = [...risks].sort((a, b) => b.score - a.score).slice(0, 3);
    return `В проекте ${project.name} отслеживается ${risks.length} рисков поставки. Наибольшего внимания требуют: ${top
      .map((risk) => risk.name)
      .join(", ")}. В первую очередь нужно закрепить владельцев, сроки снижения рисков и ранние сигналы для рисков с высокой оценкой.`;
  }
}
