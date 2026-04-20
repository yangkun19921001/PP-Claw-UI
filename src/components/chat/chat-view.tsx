import { useEffect, useRef } from "react";
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
  const sessionId = sessionKey || "ui:direct";
  const { messages, sendMessage, clearMessages, isConnected, isLoading, error } =
    useChat(sessionId);
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
            {sessionId}
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
          onClick={clearMessages}
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
