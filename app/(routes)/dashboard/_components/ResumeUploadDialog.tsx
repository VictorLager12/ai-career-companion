import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { File, Sparkles } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ResumeUploadDialogProps {
  openResumeUpload: boolean;
  setOpenResumeUpload: (open: boolean) => void;
}

function ResumeUploadDialog({
  openResumeUpload,
  setOpenResumeUpload,
}: ResumeUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!openResumeUpload) {
      setFile(null); // reset when dialog closes
    }
  }, [openResumeUpload]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const onUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    const recordId = uuidv4(); // keep accessible for router.push
    try {
      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("resumeFile", file);

      const result = await axios.post("/api/ai-resume-agent", formData);
      console.log("Upload successful:", result.data);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
      setOpenResumeUpload(false);
      router.push(`/ai-tools/ai-resume-analyzer/${recordId}`);
    }
  };

  return (
    <Dialog open={openResumeUpload} onOpenChange={setOpenResumeUpload}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            <div>
              <label
                htmlFor="resumeUpload"
                className="flex items-center flex-col justify-center p-7 border border-dashed rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <File className="h-10 w-10" />
                {file ? (
                  <h2 className="mt-3 text-blue-600">{file.name}</h2>
                ) : (
                  <h2 className="mt-3">Click here to Upload PDF file</h2>
                )}
              </label>
              <input
                type="file"
                id="resumeUpload"
                className="hidden"
                onChange={onFileChange}
                accept=".pdf"
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpenResumeUpload(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={onUploadAndAnalyze} disabled={!file || loading}>
            {loading ? (
              "Loading and Analyzing..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Upload & Analyze
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeUploadDialog;
