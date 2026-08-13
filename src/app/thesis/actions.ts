"use server";

import { revalidatePath } from "next/cache";
import { updateThesis } from "@/lib/thesis/thesis";
import { SCORE_DIMENSION_KEYS, type ScoreDimensions } from "@/lib/scoring/priority";

function linesToArray(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateThesisAction(formData: FormData) {
  const weights: Partial<Record<keyof ScoreDimensions, number>> = {};
  for (const key of SCORE_DIMENSION_KEYS) {
    const raw = formData.get(`weight_${key}`);
    if (raw != null && String(raw).trim() !== "") {
      weights[key] = Number(raw);
    }
  }

  await updateThesis({
    name: String(formData.get("name") ?? "Thesis"),
    description: String(formData.get("description") ?? "") || undefined,
    sectors: linesToArray(formData.get("sectors")),
    preferredStages: formData.getAll("preferredStages").map(String),
    positiveSignals: linesToArray(formData.get("positiveSignals")),
    negativeSignals: linesToArray(formData.get("negativeSignals")),
    hardExclusions: linesToArray(formData.get("hardExclusions")),
    weights: weights as Record<string, number>,
  });

  revalidatePath("/thesis");
}
