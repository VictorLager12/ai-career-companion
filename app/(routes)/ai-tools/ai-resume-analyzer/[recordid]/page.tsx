"use client"
import axios from 'axios';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Report from './_components/Report';

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "tiff"];
const OFFICE_EXTENSIONS = ["doc", "docx", "ppt", "pptx"];

function getExtension(url: string): string {
  const clean = url.split("?")[0]; // strip query params before reading extension
  const parts = clean.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function ResumePreview({ fileUrl }: { fileUrl?: string }) {
  if (!fileUrl) return null;

  const extension = getExtension(fileUrl);

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return (
      <img
        src={fileUrl}
        alt="Resume preview"
        className="w-full min-w-lg"
        style={{ border: "none" }}
      />
    );
  }

  if (OFFICE_EXTENSIONS.includes(extension)) {
    // No native browser support for DOCX/PPTX — use Microsoft's public viewer,
    // which just needs a publicly reachable URL (our ImageKit files already are).
    const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    return (
      <iframe
        src={officeViewerUrl}
        width={"100%"}
        height={1200}
        className="min-w-lg"
        style={{ border: "none" }}
      />
    );
  }

  if (extension === "pdf") {
    return (
      <iframe
        src={fileUrl + "#toolbar=0navpanes=0scrollbar=0"}
        width={"100%"}
        height={1200}
        className="min-w-lg"
        style={{ border: "none" }}
      />
    );
  }

  // Unrecognized format — don't attempt to render, offer a direct download instead.
  return (
    <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-gray-50">
      <p className="text-gray-500 mb-3">Preview not available for this file type.</p>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">
        Download file to view
      </a>
    </div>
  );
}

const MAX_POLL_ATTEMPTS = 20; // 20 * 3s = 60s, matches backend's own polling window
const POLL_INTERVAL_MS = 3000;

function AiResumeAnalyzer() {
  const { recordid } = useParams();
  const [pdfUrl, setPdfUrl] = useState();
  const [aiReport, setAiReport] = useState();
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  useEffect(() => {
    if (!recordid) return;
    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await axios.get("/api/history?recordId=" + recordid);
        if (cancelled) return;

        if (result.data?.content) {
          setPdfUrl(result.data?.metaData);
          setAiReport(result.data?.content);
          setStatus('ready');
          return;
        }

        attempts++;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          setStatus('failed');
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (error) {
        console.error("Failed to fetch resume analysis record:", error);
        if (!cancelled) setStatus('failed');
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [recordid])

  return (
    <div className='grid lg:grid-cols-5 grid-cols-1'>
      <div className='col-span-2'>
        <Report aiReport={aiReport} status={status} />
        

      </div>
      <div className='col-span-3'>
        <h2 className='font-bold text-2xl mb-5'>Resume Preview</h2>
        <ResumePreview fileUrl={pdfUrl} />
      </div>
    </div>
  )
}

export default AiResumeAnalyzer