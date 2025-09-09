// app/api/ai-resume-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { inngest } from "@/inngest/client";

type InngestSendResult = { ids: string[] };
type InngestRun = {
  status: string;
  // Adjust below if your Inngest output shape differs
  output?: { output?: unknown[] };
};
type InngestRunsResponse = { data: InngestRun[] };

const INNGEST_SERVER_HOST = process.env.INNGEST_SERVER_HOST!;
const INNGEST_SIGNING_KEY = process.env.INNGEST_SIGNING_KEY!;

// Explicitly ensure Node runtime (not Edge)
export const runtime = "nodejs";

async function getRuns(runId: string): Promise<InngestRunsResponse> {
  const url = `${INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
  const res = await axios.get<InngestRunsResponse>(url, {
    headers: { Authorization: `Bearer ${INNGEST_SIGNING_KEY}` },
  });
  return res.data;
}

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    if (!INNGEST_SERVER_HOST || !INNGEST_SIGNING_KEY) {
      return NextResponse.json(
        { error: "Missing INNGEST_SERVER_HOST or INNGEST_SIGNING_KEY" },
        { status: 500 }
      );
    }

    const resultIds = (await inngest.send({
      name: "AiCareerCompanion",
      data: { userInput },
    })) as InngestSendResult;

    const runId = resultIds?.ids?.[0];
    if (!runId) {
      return NextResponse.json(
        { error: "Inngest did not return a run id" },
        { status: 500 }
      );
    }

    // Poll with limits to avoid runaway functions on Vercel
    const maxAttempts = 120; // ~60s with 500ms delay
    const delayMs = 500;

    let attempt = 0;
    let runStatus: InngestRunsResponse | undefined;

    while (attempt < maxAttempts) {
      runStatus = await getRuns(runId);
      const status = runStatus?.data?.[0]?.status;
      if (status === "Completed") break;

      await new Promise((r) => setTimeout(r, delayMs));
      attempt++;
    }

    if (!runStatus || runStatus?.data?.[0]?.status !== "Completed") {
      return NextResponse.json(
        { error: "Timed out waiting for Inngest run to complete", runId },
        { status: 202 } // Accepted, not finished yet
      );
    }

    // Keep your existing response shape:
    const payload = runStatus.data?.[0]?.output?.output?.[0];
    return NextResponse.json(payload ?? null);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
