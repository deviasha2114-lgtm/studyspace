"use client";

import { useEffect, useRef } from "react";

export interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

interface ChatUIProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  channelName?: string;
}

export function ChatUI({
  messages,
  currentUserId,
  onSendMessage,
  isConnected,
  channelName = "general",
}: ChatUIProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const val = inputRef.current?.value.trim();
    if (!val || !isConnected) return;
    onSendMessage(val);
    inputRef.current!.value = "";
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <span className="font-semibold text-gray-200"># {channelName}</span>
        <span
          className={`ml-auto w-2 h-2 rounded-full ${
            isConnected ? "bg-emerald-400" : "bg-yellow-400 animate-pulse"
          }`}
        />
        <span className="text-xs text-gray-400">
          {isConnected ? "Live" : "Connecting..."}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.userId === currentUserId ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
              {msg.username[0].toUpperCase()}
            </div>
            <div
              className={`max-w-[70%] ${
                msg.userId === currentUserId ? "items-end" : "items-start"
              } flex flex-col gap-1`}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-gray-300">
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.userId === currentUserId
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-800 text-gray-100 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isConnected
                ? `Message #${channelName}`
                : "Waiting for connection..."
            }
            disabled={!isConnected}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!isConnected}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
