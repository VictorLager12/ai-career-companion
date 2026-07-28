// app/api/ai-resume-agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import LlamaCloud from "@llamaindex/llama-cloud";
import ImageKit from "imagekit";
import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";
// LlamaParse (fast tier) + ImageKit upload run in parallel in this route (see
// below). This does not include a wait for the Inngest job to complete (see
// note near the bottom of this file), so 90s is comfortable headroom.
export const maxDuration = 90;

// Vercel Node.js serverless functions have a hard ~4.5MB request body limit.
// We cap well under that to leave room for multipart/form-data overhead.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "doc",
  "pptx",
  "ppt",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "tiff",
];

const imagekit = new ImageKit({
  // @ts-ignore
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  // @ts-ignore
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  // @ts-ignore
  urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL,
});

const llamaCloud = new LlamaCloud({ apiKey: process.env.LLAMA_CLOUD_API_KEY });

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const resumeFile: any = formData.get("resumeFile");
  const recordId = formData.get("recordId");
  const user = await currentUser();

  // --- Validation ---
  if (!resumeFile || typeof resumeFile === "string") {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const originalFileName: string = resumeFile.name || "document";
  const extension = getExtension(originalFileName);

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      {
        error: `Unsupported file type ".${extension || "unknown"}". Supported formats: PDF, DOC, DOCX, PPT, PPTX, or a scanned image (PNG, JPG, WEBP, TIFF).`,
      },
      { status: 400 }
    );
  }

  if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Please upload a file under 4MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await resumeFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  const pipelineStart = Date.now();

  // --- Parse the document with LlamaParse (PDF, DOCX, PPTX, and scanned/image
  // docs via OCR) AND upload the original file to ImageKit for the preview
  // panel, IN PARALLEL. Neither depends on the other's output, so there's no
  // reason to run them sequentially.
  //
  // Tier changed from "agentic" to "fast": LlamaParse's own docs report parsing
  // averages ~45s, and attribute the difference between tiers specifically to
  // documents needing complex-table/chart reasoning — not typical for resumes,
  // which are short, well-structured, mostly-text documents. "fast" is both
  // the quickest and cheapest tier. If parse quality on some file noticeably
  // suffers, "cost_effective" is a middle ground (still far faster than
  // agentic — see the timing logs below to confirm before changing further).
  const parsePromise = (async () => {
    const t0 = Date.now();
    const uploadedFile = await llamaCloud.files.create({
      file: new File([buffer], originalFileName, {
        type: resumeFile.type || "application/octet-stream",
      }),
      purpose: "parse",
    });
    const t1 = Date.now();
    console.log(`[timing] LlamaParse file upload: ${t1 - t0}ms`);

    const parseResult = await llamaCloud.parsing.parse({
      file_id: uploadedFile.id,
      tier: "fast",
      version: "latest",
      expand: ["markdown"],
    });
    const t2 = Date.now();
    console.log(`[timing] LlamaParse parse (tier=fast): ${t2 - t1}ms`);

    return parseResult;
  })();

  const imageKitPromise = (async () => {
    const t0 = Date.now();
    const imageKitFile = await imagekit.upload({
      file: base64,
      fileName: `${Date.now()}.${extension}`,
      isPublished: true,
    });
    console.log(`[timing] ImageKit upload: ${Date.now() - t0}ms`);
    return imageKitFile;
  })();

  let parseResult: Awaited<typeof parsePromise>;
  let imageKitFile: Awaited<typeof imageKitPromise>;
  try {
    [parseResult, imageKitFile] = await Promise.all([parsePromise, imageKitPromise]);
  } catch (error) {
    console.error("Document processing error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your document. Please try again." },
      { status: 502 }
    );
  }

  console.log(`[timing] Parse + upload stage (parallel) total: ${Date.now() - pipelineStart}ms`);

  if (!parseResult.markdown) {
    return NextResponse.json(
      { error: "We couldn't extract any readable content from this file. Please try a different file." },
      { status: 422 }
    );
  }

  const extractedText = parseResult.markdown.pages
    .map((page: any) => page.markdown)
    .join("\n\n---\n\n")
    .trim();

  if (!extractedText) {
    return NextResponse.json(
      { error: "We couldn't extract any readable content from this file. Please try a different file." },
      { status: 422 }
    );
  }

  const uploadFileUrl: string = imageKitFile.url;

  // --- Kick off the AI analysis job. Only small strings go through the Inngest
  // event now (Inngest's Free plan caps event payloads at 256KiB, which the raw
  // base64 file was already close to). ---
  const sendStart = Date.now();
  const resultIds = await inngest.send({
    name: "AiResumeAgent",
    data: {
      recordId,
      extractedText,
      fileUrl: uploadFileUrl,
      aiAgentType: "/ai-tools/ai-resume-analyzer",
      userEmail: user?.primaryEmailAddress?.emailAddress,
    },
  });
  console.log(`[timing] inngest.send: ${Date.now() - sendStart}ms`);
  console.log(`[timing] Total route time: ${Date.now() - pipelineStart}ms`);

  const runId = resultIds?.ids?.[0];
  if (!runId) {
    return NextResponse.json({ error: "Inngest did not return a run id" }, { status: 500 });
  }

  // Note: this route no longer polls Inngest's run-status API for completion.
  // The frontend (page.tsx) already polls /api/history for the DB row keyed
  // on `recordId` independently of this response — that's the actual source
  // of truth for success/failure, and it was already ignoring this response
  // body. Waiting here just held the serverless function open for up to an
  // extra 60s for no consumer, stacked on top of the LlamaParse/ImageKit work
  // above — removing it meaningfully lowers the odds of hitting Vercel's
  // function timeout on slower documents.
  return NextResponse.json({ recordId, runId, status: "processing" }, { status: 202 });
}