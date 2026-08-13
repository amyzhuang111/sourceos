-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('NEW', 'RESEARCHING', 'REVIEW', 'HIGH', 'MEDIUM', 'LOW', 'PASS', 'CONTACTED', 'MEETING', 'TRACKING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('PRE_SEED', 'SEED', 'SERIES_A', 'SERIES_B', 'SERIES_C_PLUS', 'GROWTH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('FUNDING', 'LAUNCH', 'CUSTOMER', 'HIRING', 'TRAFFIC', 'FOUNDER', 'INVESTOR', 'PRODUCT', 'PARTNERSHIP', 'PRICING', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('FACT', 'INFERENCE', 'USER_NOTE', 'USER_DECISION', 'AGENT_ANALYSIS');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'PASS', 'CONTACT', 'MEET', 'TRACK');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SourcingQueueStatus" AS ENUM ('DISCOVERED', 'IDENTITY_RESOLVED', 'DEDUPED', 'LIGHT_ENRICHED', 'DISCOVERY_SCORED', 'RESEARCH_QUEUE', 'RESEARCHED', 'INVESTMENT_SCORED', 'USER_REVIEW', 'IDENTITY_AMBIGUOUS', 'SOURCE_BLOCKED', 'FETCH_FAILED', 'INSUFFICIENT_EVIDENCE', 'DUPLICATE', 'OUT_OF_SCOPE');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonicalDomain" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "stage" "Stage" NOT NULL DEFAULT 'UNKNOWN',
    "sectors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subsectors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "businessModel" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'NEW',
    "priority" DOUBLE PRECISION,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSeenSource" TEXT,
    "firstSeenStrategy" TEXT,
    "discoveredBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contradictedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourcingStatus" "SourcingQueueStatus" NOT NULL DEFAULT 'DISCOVERED',
    "lastResearchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "companyId" TEXT,
    "linkedinUrl" TEXT,
    "xUrl" TEXT,
    "personalUrl" TEXT,
    "priorCompanies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "education" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundingEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "round" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "announcedAt" TIMESTAMP(3),
    "investors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valuation" DOUBLE PRECISION,
    "sourceUrl" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "SignalType" NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "confidence" DOUBLE PRECISION,
    "rawMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "personId" TEXT,
    "runId" TEXT,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "sourceUrl" TEXT,
    "sourceTitle" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" DOUBLE PRECISION,
    "author" TEXT NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchSnapshot" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "problem" TEXT,
    "product" TEXT,
    "whyNow" TEXT,
    "market" TEXT,
    "traction" TEXT,
    "founders" TEXT,
    "competition" TEXT,
    "technicalDepth" TEXT,
    "distribution" TEXT,
    "risks" TEXT,
    "openQuestions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidence" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ResearchSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "researchSnapshotId" TEXT,
    "thesisFit" DOUBLE PRECISION NOT NULL,
    "founderQuality" DOUBLE PRECISION NOT NULL,
    "technicalDepth" DOUBLE PRECISION NOT NULL,
    "marketPotential" DOUBLE PRECISION NOT NULL,
    "timing" DOUBLE PRECISION NOT NULL,
    "traction" DOUBLE PRECISION NOT NULL,
    "differentiation" DOUBLE PRECISION NOT NULL,
    "distributionPotential" DOUBLE PRECISION NOT NULL,
    "personalInterest" DOUBLE PRECISION NOT NULL,
    "weightedScore" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "scoringVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thesis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "positiveSignals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "negativeSignals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredStages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sectors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weights" JSONB,
    "hardExclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "decision" "DecisionType" NOT NULL,
    "reason" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasteProposal" (
    "id" TEXT NOT NULL,
    "proposedChange" TEXT NOT NULL,
    "proposedChangeDetail" JSONB,
    "supportingDecisions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "counterExamples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "confidence" DOUBLE PRECISION,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "TasteProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceProposal" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT,
    "rationale" TEXT,
    "companiesDiscovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "proposedTier" TEXT,
    "proposedCadence" TEXT,
    "accessMethod" TEXT,
    "risks" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "task" TEXT,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "inputs" JSONB,
    "outputs" JSONB,
    "errors" JSONB,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "costUsd" DOUBLE PRECISION,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_canonicalDomain_key" ON "Company"("canonicalDomain");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE INDEX "Company_priority_idx" ON "Company"("priority");

-- CreateIndex
CREATE INDEX "Person_companyId_idx" ON "Person"("companyId");

-- CreateIndex
CREATE INDEX "FundingEvent_companyId_idx" ON "FundingEvent"("companyId");

-- CreateIndex
CREATE INDEX "Signal_companyId_idx" ON "Signal"("companyId");

-- CreateIndex
CREATE INDEX "Signal_type_idx" ON "Signal"("type");

-- CreateIndex
CREATE INDEX "Mention_companyId_idx" ON "Mention"("companyId");

-- CreateIndex
CREATE INDEX "Mention_personId_idx" ON "Mention"("personId");

-- CreateIndex
CREATE INDEX "Mention_runId_idx" ON "Mention"("runId");

-- CreateIndex
CREATE INDEX "ResearchSnapshot_companyId_idx" ON "ResearchSnapshot"("companyId");

-- CreateIndex
CREATE INDEX "Score_companyId_idx" ON "Score"("companyId");

-- CreateIndex
CREATE INDEX "Decision_companyId_idx" ON "Decision"("companyId");

-- CreateIndex
CREATE INDEX "AgentRun_agent_idx" ON "AgentRun"("agent");

-- CreateIndex
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundingEvent" ADD CONSTRAINT "FundingEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchSnapshot" ADD CONSTRAINT "ResearchSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_researchSnapshotId_fkey" FOREIGN KEY ("researchSnapshotId") REFERENCES "ResearchSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
