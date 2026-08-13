"use server";

import { revalidatePath } from "next/cache";
import { recordDecision } from "@/lib/decisions/decide";
import { runResearch } from "@/lib/research/run";
import type { DecisionType } from "@/generated/prisma/client";

export async function decideAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  const decision = String(formData.get("decision")) as DecisionType;
  const reason = formData.get("reason") ? String(formData.get("reason")) : undefined;

  await recordDecision(companyId, decision, reason);

  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/feedback");
}

export async function runResearchAction(formData: FormData) {
  const companyId = String(formData.get("companyId"));
  await runResearch(companyId);

  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/runs");
  revalidatePath("/mentions");
}
