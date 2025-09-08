"use client";

import React, { useState } from "react";

import Image from "next/image"; // Add this import statement
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToggleLeft } from "lucide-react";
import ResumeUploadDialog from "./ResumeUploadDialog";


interface TOOL {
  name: string;
  desc: string;
  icon: string;
  button: string;
  path: string;
}

type AIToolProps = {
  tool: TOOL;
};

function AiToolCard({ tool }: AIToolProps) {
  const id = uuidv4();
  const { user } = useUser();
  const router = useRouter();
  const [openResumeUpload, setOpenResumeUpload] = useState(false);
  

  const onClickButton = async () => {
    if (tool.name === "AI Resume Analyzer") {
      setOpenResumeUpload(true);
      return;
    }
    
    // Create New record to History Table
    const result = await axios.post("/api/history", {
      recordId: id,
      content: [],
      aiAgentType: tool.path
    });
    console.log(result);
    router.push(tool.path + "/" + id);
  };
  return (
    <div className="p-3 border rounded-lg">
      <Image src={tool.icon} width={50} height={50} alt={tool.name} />
      <h2 className="font-bold mt-2">{tool.name}</h2>
      <p className="text-gray-400">{tool.desc}</p>

      <Button className="w-full mt-3" onClick={onClickButton}>
        {tool.button}
      </Button>

      <ResumeUploadDialog
        openResumeUpload={openResumeUpload}
        setOpenResumeUpload={setOpenResumeUpload}
      />
      
    </div>
  );
}

export default AiToolCard;
