import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  projectType: z.string().min(1),
  stage: z.string().min(1),
  deliveryModel: z.string().min(1),
  businessCriticality: z.string().min(1)
});

export const answersSchema = z.object({
  requirementsMaturity: z.enum(["not_defined", "partially_defined", "mostly_defined", "fully_defined"]),
  mvpScopeFixed: z.boolean(),
  stakeholdersInfluencingRequirements: z.number().int().min(0).max(20),
  requirementChanges: z.enum(["rarely", "sometimes", "often", "very_often"]),
  acceptanceCriteria: z.enum(["no", "partially", "mostly", "yes"]),
  changeRequestProcess: z.boolean(),
  deadlineRigidity: z.enum(["flexible", "somewhat_flexible", "fixed", "immovable"]),
  timeUntilDeadline: z.enum(["less_than_1_month", "one_to_three_months", "three_to_six_months", "more_than_six_months"]),
  scheduleBuffer: z.enum(["none", "small", "moderate", "large"]),
  budgetFlexibility: z.enum(["flexible", "limited", "fixed", "unknown"]),
  teamSize: z.number().int().min(1).max(200),
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
  keyStakeholdersCount: z.number().int().min(1).max(50),
  singleDecisionMaker: z.boolean(),
  externalVendors: z.boolean(),
  dependenciesOnOtherTeams: z.boolean(),
  clientResponseSpeed: z.enum(["fast", "normal", "slow", "unpredictable"]),
  communicationClarity: z.enum(["clear", "mostly_clear", "unclear", "chaotic"])
});

export const exportSchema = z.object({
  format: z.literal("markdown"),
  sections: z.array(z.enum(["executive_summary", "risk_register", "mitigation_plan", "risk_details"])).default([
    "executive_summary",
    "risk_register",
    "mitigation_plan",
    "risk_details"
  ])
});
