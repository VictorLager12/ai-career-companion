"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Pencil, RotateCcw, X } from "lucide-react";

type Message = {
  content: string;
  role: string;
  type: string;
};

interface ChatMessageProps {
  message: Message;
  disabled: boolean; // true while an AI response is in flight, to avoid overlapping edits/retries
  onEditAndRegenerate: (newContent: string) => void;
  onRetry: (content: string) => void;
}

// Custom link renderer for ReactMarkdown: makes links clearly distinguishable
// from surrounding text (underlined + themed color, matching the app's
// existing primary color used elsewhere e.g. on buttons) and always opens
// them in a new tab so the chat session is never navigated away from.
const markdownComponents = {
  a: ({ href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80"
      {...props}
    >
      {children}
    </a>
  ),
};

function ChatMessage({ message, disabled, onEditAndRegenerate, onRetry }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const textContent =
    typeof message.content === "string" ? message.content : JSON.stringify(message.content);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const startEdit = () => {
    setDraft(textContent);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!draft.trim()) return;
    onEditAndRegenerate(draft);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`p-4 rounded-lg shadow-md ${
            isUser ? "bg-gray-300 text-gray-800" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[60px] bg-white text-gray-800"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={!draft.trim()}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <ReactMarkdown components={markdownComponents}>{textContent}</ReactMarkdown>
          )}
        </div>

        {!isEditing && (
          <div className={`flex gap-1 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={onCopy}
              title={copied ? "Copied!" : "Copy"}
              aria-label={copied ? "Copied" : "Copy message"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>

            {isUser && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={startEdit}
                  disabled={disabled}
                  title="Edit"
                  aria-label="Edit message"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => onRetry(textContent)}
                  disabled={disabled}
                  title="Retry"
                  aria-label="Retry message"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;