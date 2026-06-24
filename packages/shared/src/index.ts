export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskCategory =
  | "scope"
  | "timeline"
  | "team"
  | "technical"
  | "dependency"
  | "stakeholder"
  | "quality"
  | "release"
  | "compliance"
  | "data"
  | "performance"
  | "budget";

export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  projectType: string;
  stage: string;
  deliveryModel: string;
  businessCriticality: string;
  createdAt: string;
  updatedAt: string;
};

export type RiskReviewStatus = "draft" | "generating" | "completed" | "failed";

export type RiskReview = {
  id: string;
  projectId: string;
  status: RiskReviewStatus;
  overallScore: number | null;
  riskLevel: RiskLevel | null;
  executiveSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RiskAssessmentAnswers = {
  requirementsMaturity: "not_defined" | "partially_defined" | "mostly_defined" | "fully_defined";
  mvpScopeFixed: boolean;
  stakeholdersInfluencingRequirements: number;
  requirementChanges: "rarely" | "sometimes" | "often" | "very_often";
  acceptanceCriteria: "no" | "partially" | "mostly" | "yes";
  changeRequestProcess: boolean;
  deadlineRigidity: "flexible" | "somewhat_flexible" | "fixed" | "immovable";
  timeUntilDeadline: "less_than_1_month" | "one_to_three_months" | "three_to_six_months" | "more_than_six_months";
  scheduleBuffer: "none" | "small" | "moderate" | "large";
  budgetFlexibility: "flexible" | "limited" | "fixed" | "unknown";
  teamSize: number;
  teamDomainExperience: "none" | "low" | "medium" | "high";
  teamTechnologyExperience: "none" | "low" | "medium" | "high";
  keyPeopleShared: boolean;
  dedicatedQa: boolean;
  technicalLead: boolean;
  technicalComplexity: "low" | "medium" | "high" | "very_high";
  newTechnology: boolean;
  legacySystem: boolean;
  externalApi: boolean;
  dataMigration: boolean;
  securityCompliance: boolean;
  performanceCritical: boolean;
  keyStakeholdersCount: number;
  singleDecisionMaker: boolean;
  externalVendors: boolean;
  dependenciesOnOtherTeams: boolean;
  clientResponseSpeed: "fast" | "normal" | "slow" | "unpredictable";
  communicationClarity: "clear" | "mostly_clear" | "unclear" | "chaotic";
};

export type Risk = {
  id: string;
  reviewId: string;
  name: string;
  category: RiskCategory;
  description: string;
  cause: string;
  consequence: string;
  probability: number;
  impact: number;
  urgency: number;
  score: number;
  level: RiskLevel;
  confidence: "low" | "medium" | "high";
  mitigation: string[];
  contingency: string;
  earlyWarningSignals: string[];
  ownerSuggestion: string;
  status: "open" | "monitoring" | "mitigated" | "closed";
};

export type ActionItem = {
  id: string;
  reviewId: string;
  title: string;
  description: string;
  ownerSuggestion: string;
  priority: RiskLevel;
  dueInDays: number;
};

export type RiskReport = {
  project: Project;
  review: RiskReview;
  overallScore: number;
  riskLevel: RiskLevel;
  executiveSummary: string;
  topRisks: Risk[];
  risksByCategory: Record<RiskCategory, Risk[]>;
  actionPlan: ActionItem[];
};
