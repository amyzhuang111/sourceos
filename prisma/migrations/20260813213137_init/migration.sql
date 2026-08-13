-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "canonicalDomain" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "sectors" JSONB,
    "subsectors" JSONB,
    "businessModel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" REAL,
    "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSeenSource" TEXT,
    "firstSeenStrategy" TEXT,
    "discoveredBy" JSONB,
    "verifiedBy" JSONB,
    "contradictedBy" JSONB,
    "sourcingStatus" TEXT NOT NULL DEFAULT 'DISCOVERED',
    "lastResearchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "companyId" TEXT,
    "linkedinUrl" TEXT,
    "xUrl" TEXT,
    "personalUrl" TEXT,
    "priorCompanies" JSONB,
    "education" JSONB,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Person_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FundingEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "round" TEXT,
    "amount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "announcedAt" DATETIME,
    "investors" JSONB,
    "valuation" REAL,
    "sourceUrl" TEXT,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FundingEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT,
    "observedAt" DATETIME NOT NULL,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "confidence" REAL,
    "rawMetadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT,
    "personId" TEXT,
    "runId" TEXT,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceTitle" TEXT,
    "observedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" REAL,
    "author" TEXT NOT NULL,
    CONSTRAINT "Mention_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mention_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mention_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "openQuestions" JSONB,
    "evidence" JSONB,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ResearchSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "researchSnapshotId" TEXT,
    "thesisFit" REAL NOT NULL,
    "founderQuality" REAL NOT NULL,
    "technicalDepth" REAL NOT NULL,
    "marketPotential" REAL NOT NULL,
    "timing" REAL NOT NULL,
    "traction" REAL NOT NULL,
    "differentiation" REAL NOT NULL,
    "distributionPotential" REAL NOT NULL,
    "personalInterest" REAL NOT NULL,
    "weightedScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "reasoning" TEXT,
    "scoringVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Score_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_researchSnapshotId_fkey" FOREIGN KEY ("researchSnapshotId") REFERENCES "ResearchSnapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Thesis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "positiveSignals" JSONB,
    "negativeSignals" JSONB,
    "preferredStages" JSONB,
    "sectors" JSONB,
    "weights" JSONB,
    "hardExclusions" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Decision_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TasteProposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposedChange" TEXT NOT NULL,
    "proposedChangeDetail" JSONB,
    "supportingDecisions" JSONB,
    "counterExamples" JSONB,
    "confidence" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateTable
CREATE TABLE "SourceProposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceName" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT,
    "rationale" TEXT,
    "companiesDiscovered" JSONB,
    "proposedTier" TEXT,
    "proposedCadence" TEXT,
    "accessMethod" TEXT,
    "risks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "task" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "inputs" JSONB,
    "outputs" JSONB,
    "errors" JSONB,
    "model" TEXT,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "costUsd" REAL
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
