"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, SendIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import EmptyState from "../_components/EmptyState";
import axios from "axios";
import ReactMarkdown from "react-markdown";
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

  const onSend = async () => {
    if (!userInput.trim() || loading) return;

    setLoading(true);

    setMessagesList((prev) => [
      ...prev,
      {
        content: userInput,
        role: "user",
        type: "text",
      },
    ]);
    setUserInput("");

    try {
      const result = await axios.post("/api/ai-career-companion-agent", {
        userInput: userInput,
      });
      console.log("API Response:", result.data);

      setMessagesList((prev) => [
        ...prev,
        {
          content: result.data.content || "No response from AI",
          role: "assistant",
          type: "text",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessagesList((prev) => [
        ...prev,
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
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } my-2`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg shadow-md ${
                    message.role === "user"
                      ? "bg-gray-300 text-gray-800"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <ReactMarkdown>
                    {typeof message.content === "string"
                      ? message.content
                      : JSON.stringify(message.content)}
                  </ReactMarkdown>
                </div>
              </div>
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
