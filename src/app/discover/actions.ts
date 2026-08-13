"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addCompanyByUrl } from "@/lib/companies/create";
import { runResearch } from "@/lib/research/run";

export async function addCompanyAction(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const runNow = formData.get("runNow") === "on";

  if (!url) throw new Error("URL is required");

  const { company } = await addCompanyByUrl(url, { name: name || undefined, source: "manual" });

  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/discover");

  if (runNow) {
    try {
      await runResearch(company.id);
    } catch {
      // Research failure shouldn't block navigation — the company page
      // shows the failed AgentRun and lets the user retry.
    }
  }

  redirect(`/companies/${company.id}`);
}
