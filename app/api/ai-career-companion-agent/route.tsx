import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: any) {
  const { userInput } = await req.json();

  // Helper function is now defined inside the POST handler
  async function getRuns(runId: string) {
    const result = await axios.get(`${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`, {
      headers: {
        Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`
      }
    });
    return result.data;
  }

  const resultIds = await inngest.send({
    name: 'AiCareerCompanion',
    data: {
      userInput: userInput
    }
  });
  const runId = resultIds?.ids[0];

  let runStatus;
  while (true) {
    runStatus = await getRuns(runId);
    if (runStatus?.data[0]?.status === 'Completed') {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return NextResponse.json(runStatus.data?.[0].output?.output[0]);
}