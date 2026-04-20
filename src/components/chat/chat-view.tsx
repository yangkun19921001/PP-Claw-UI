import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, Trash2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ChatViewProps {
  sessionKey?: string;
}

export function ChatView({ sessionKey }: ChatViewProps) {
  const [generatedId] = useState(() => `ui:${Date.now()}`);
  const isNewChat = !sessionKey;

  // For new chats: sessionKey=generatedId, chatId=generatedId
  // For existing sessions: sessionKey is full backend key (e.g. "make:ui:ui:123"),
  //   chatId is extracted (e.g. "ui:123") for WS matching
  let chatId: string | undefined;
  if (sessionKey) {
    const colonIdx = sessionKey.indexOf(":");
    if (colonIdx >= 0) {
      const rest = sessionKey.substring(colonIdx + 1);
      const secondColon = rest.indexOf(":");
      if (secondColon >= 0) {
        chatId = rest.substring(secondColon + 1);
      }
    }
  }
  const sessionId = sessionKey || generatedId;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasSentRef = useRef(false);
  const { messages, sendMessage: rawSend, clearMessages, isConnected, isLoading, error } =
    useChat(sessionId, chatId);

  const sendMessage = useCallback(
    (content: string, media?: string[]) => {
      rawSend(content, media);
      if (isNewChat && !hasSentRef.current) {
        hasSentRef.current = true;
        navigate(`/chat/${encodeURIComponent(sessionId)}`, { replace: true });
      }
    },
    [rawSend, isNewChat, sessionId, navigate],
  );

  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      const latest = messages[messages.length - 1];
      if (latest?.role === "assistant" && latest.type !== "progress") {
        queryClient.invalidateQueries({ queryKey: ["sessions"] });
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, queryClient]);
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium truncate max-w-[300px]">
            {isNewChat && messages.length === 0 ? t("chat.new") : sessionId}
          </h2>
          <Badge
            variant={isConnected ? "success" : "destructive"}
            className="text-[10px]"
          >
            {isConnected ? t("common.connected") : t("common.disconnected")}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { clearMessages(); queryClient.invalidateQueries({ queryKey: ["sessions"] }); }}
          className="text-xs text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          {t("common.clear")}
        </Button>
      </div>

      {error && !isConnected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-error/5 border-b border-error/20 text-error text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error === "Disconnected from server" ? t("chat.disconnectedFromServer") : error}</span>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-[920px] mx-auto px-4 py-6 space-y-5">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">{t("chat.empty")}</p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              media={msg.media}
              type={msg.type}
              timestamp={msg.timestamp}
              toolCalls={msg.toolCalls}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2">
                <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
              </div>
              <div className="rounded-[20px] rounded-tl-sm bg-surface-1 border border-border px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} reconnecting={!isConnected} />
    </div>
  );
}
