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

const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "pptx", "ppt", "png", "jpg", "jpeg", "webp", "tiff"];
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB — matches the server-side cap in /api/ai-resume-agent

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function ResumeUploadDialog({
  openResumeUpload,
  setOpenResumeUpload,
}: ResumeUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!openResumeUpload) {
      setFile(null); // reset when dialog closes
      setError(null);
    }
  }, [openResumeUpload]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const extension = getExtension(selectedFile.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Unsupported file type. Please upload a PDF, DOC, DOCX, PPT, PPTX, or a scanned image (PNG, JPG, WEBP, TIFF).");
      setFile(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Please upload a file under 4MB.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const onUploadAndAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const recordId = uuidv4(); // keep accessible for router.push
    try {
      const formData = new FormData();
      formData.append("recordId", recordId);
      formData.append("resumeFile", file);

      const result = await axios.post("/api/ai-resume-agent", formData);
      console.log("Upload successful:", result.data);
      setOpenResumeUpload(false);
      router.push(`/ai-tools/ai-resume-analyzer/${recordId}`);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Something went wrong while submitting your resume. Please try again.");
    } finally {
      setLoading(false);
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
                  <h2 className="mt-3">Click here to upload your resume (PDF, DOCX, PPTX, or scanned image)</h2>
                )}
              </label>
              <input
                type="file"
                id="resumeUpload"
                className="hidden"
                onChange={onFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.tiff"
              />
              {error && (
                <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
              )}
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