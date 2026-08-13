import { db } from "@/lib/db/client";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Every automated action must be traceable back to a run (CLAUDE.md §
 * Observability). Wraps a unit of agent work in an AgentRun row that
 * transitions RUNNING -> SUCCEEDED/FAILED, recording inputs/outputs/errors.
 */
export async function withAgentRun<T>(
  agent: string,
  task: string,
  inputs: Prisma.InputJsonValue,
  fn: (runId: string) => Promise<{ result: T; outputs: Prisma.InputJsonValue; model?: string }>
): Promise<T> {
  const run = await db.agentRun.create({
    data: { agent, task, status: "RUNNING", inputs },
  });

  try {
    const { result, outputs, model } = await fn(run.id);
    await db.agentRun.update({
      where: { id: run.id },
      data: { status: "SUCCEEDED", completedAt: new Date(), outputs, model },
    });
    return result;
  } catch (err) {
    await db.agentRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errors: { message: err instanceof Error ? err.message : String(err) },
      },
    });
    throw err;
  }
}
