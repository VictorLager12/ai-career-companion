// app/api/ai-resume-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { inngest } from "@/inngest/client";
import axios from "axios";
import { currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const resumeFile: any = formData.get("resumeFile");
  const recordId = formData.get("recordId");
  const user = await currentUser();

  const loader = new WebPDFLoader(resumeFile);
  const docs = await loader.load();
  console.log(docs[0]); // raw PDF text

  const arrayBuffer = await resumeFile.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const resultIds = await inngest.send({
    name: "AiResumeAgent",
    data: {
      recordId,
      base64ResumeFile: base64,
      pdfText: docs[0]?.pageContent,
      aiAgentType: "/ai-tools/ai-resume-analyzer",
      userEmail: user?.primaryEmailAddress?.emailAddress,
    },
  });

  const runId = resultIds?.ids?.[0];
  if (!runId) {
    return NextResponse.json({ error: "Inngest did not return a run id" }, { status: 500 });
  }

  // Polling with a cap to avoid runaway function
  const maxAttempts = 120; // 120 * 500ms = 60s total
  const delayMs = 500;
  let runStatus: any = undefined;
  let attempts = 0;

  while (attempts < maxAttempts) {
    runStatus = await getRuns(runId);
    console.log(runStatus?.data);
    if (runStatus?.data?.[0]?.status === "Completed") {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    attempts++;
  }

  if (!runStatus) {
    return NextResponse.json({ error: "Failed to fetch run status" }, { status: 500 });
  }

  if (runStatus?.data?.[0]?.status !== "Completed") {
    // Not completed within timeout — return runId so client can continue polling
    return NextResponse.json(
      { runId, status: runStatus?.data?.[0]?.status ?? "unknown" },
      { status: 202 }
    );
  }

  return NextResponse.json(runStatus.data?.[0].output?.output[0] ?? null);
}

// PRIVATE helper — not exported (fixes App Router type error)
async function getRuns(runId: string) {
  const result = await axios.get(
    `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`,
    {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
      },
    }
  );

  return result.data;
}
