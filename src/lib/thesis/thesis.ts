import { db } from "@/lib/db/client";

export async function getActiveThesis() {
  return db.thesis.findFirst({ where: { active: true }, orderBy: { version: "desc" } });
}

export async function listThesisHistory() {
  return db.thesis.findMany({ orderBy: { version: "desc" } });
}

export interface ThesisInput {
  name: string;
  description?: string;
  sectors: string[];
  preferredStages: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  hardExclusions: string[];
  weights: Record<string, number>;
}

/**
 * Editing the thesis never mutates history in place — it deactivates the
 * current version and inserts a new one, so /thesis always has a version
 * trail to look back on.
 */
export async function updateThesis(input: ThesisInput) {
  const current = await getActiveThesis();
  const nextVersion = (current?.version ?? 0) + 1;

  return db.$transaction(async (tx) => {
    if (current) {
      await tx.thesis.update({ where: { id: current.id }, data: { active: false } });
    }
    return tx.thesis.create({
      data: {
        name: input.name,
        description: input.description,
        sectors: input.sectors,
        preferredStages: input.preferredStages,
        positiveSignals: input.positiveSignals,
        negativeSignals: input.negativeSignals,
        hardExclusions: input.hardExclusions,
        weights: input.weights,
        version: nextVersion,
        active: true,
      },
    });
  });
}
