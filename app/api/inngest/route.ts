import { serve } from "inngest/next";

import { inngest } from "../../../inngest/client";
import { AiCareerCompanion, AiResumeAgent,   } from "@/inngest/functions";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    AiCareerCompanion,
    AiResumeAgent,
    
    /* your functions will be passed here later! */
  ],
});
