"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import EmptyState from "../_components/EmptyState";
import ChatMessage from "../_components/ChatMessage";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type Message = {
  content: string;
  role: string;
  type: string;
};

function AiChat() {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const { chatid }: any = useParams();
  const router = useRouter();
  console.log(chatid);

  useEffect(() => {
    chatid && GetMessageList();
  }, [chatid]);

  const GetMessageList = async () => {
    const result = await axios.get("/api/history?recordId=" + chatid);
    console.log(result.data);
    setMessagesList(result?.data?.content);
  };

  // Shared by onSend and onRetryMessage: sends a single user input string to
  // the existing AI Career Companion API (unchanged request/response shape)
  // and appends the assistant's reply on top of the given history.
  const sendToAI = async (input: string, historyBeforeSend: Message[]) => {
    setLoading(true);
    try {
      const result = await axios.post("/api/ai-career-companion-agent", {
        userInput: input,
      });
      console.log("API Response:", result.data);

      setMessagesList([
        ...historyBeforeSend,
        {
          content: result.data.content || "No response from AI",
          role: "assistant",
          type: "text",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessagesList([
        ...historyBeforeSend,
        {
          content: "Sorry, I encountered an error. Please try again.",
          role: "assistant",
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    if (!userInput.trim() || loading) return;

    const updatedHistory: Message[] = [
      ...messagesList,
      {
        content: userInput,
        role: "user",
        type: "text",
      },
    ];
    setMessagesList(updatedHistory);
    const input = userInput;
    setUserInput("");

    await sendToAI(input, updatedHistory);
  };

  // Edit-and-regenerate is handled by onRetryMessage below — Save reuses the
  // same truncate + sendToAI logic Retry already uses, just with the newly
  // edited text.

  // Retry: truncates the conversation to end at this user message (dropping
  // whatever came after it, including a stale assistant reply), applies the
  // latest text for that message, then requests one fresh assistant reply.
  const onRetryMessage = async (index: number, content: string) => {
    if (loading) return;
    const truncated = messagesList.slice(0, index + 1);
    truncated[index] = { ...truncated[index], content };
    setMessagesList(truncated);
    await sendToAI(content, truncated);
  };

  useEffect(() => {
    // Save message into Database
    messagesList.length > 0 && updateMessageList();
  }, [messagesList]);

  const updateMessageList = async () => {
    const result = await axios.put("/api/history", {
      content: messagesList,
      recordId: chatid,
    });
    console.log(result);
  };

  const onNewChat = async () => {
    const id = uuidv4();
    // Create New record to History Table
    const result = await axios.post("/api/history", {
      recordId: id,
      content: [],
    });
    console.log(result);
    router.replace(`/ai-tools/ai-chat/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-10 md:px-24 lg:px-36 xl:px-48">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 className="font-bold text-lg">AI Career Q/A Chat</h2>
          <p>
            Empower your career journey with personalized insights and
            up-to-date labor market intelligence tailored to your goals
          </p>
        </div>
        <Button onClick={onNewChat}>+ New Chat</Button>
      </div>
      <div className="flex flex-col h-[75vh] mt-6">
        {messagesList.length === 0 ? (
          <div>
            {/* Empty State Options */}
            <EmptyState
              selectedQuestion={(question: string) => setUserInput(question)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-4">
            {/* Message List */}
            {messagesList.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                disabled={loading}
                onEditAndRegenerate={(newContent) => onRetryMessage(index, newContent)}
                onRetry={(content) => onRetryMessage(index, content)}
              />
            ))}
            {loading && (
              <div className="flex items-center my-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between items-center gap-6">
          {/* Textarea Field */}
          <Textarea
            placeholder="Type here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={loading}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[200px]"
          />
          <Button onClick={onSend} disabled={loading || !userInput.trim()}>
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AiChat;