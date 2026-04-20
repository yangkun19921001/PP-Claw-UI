import { useCallback, useEffect, useRef, useState } from "react";
import { WSClient } from "@/lib/ws-client";
import apiClient from "@/lib/api-client";
import type { WSEvent } from "@/types/api";
import type { ToolCallInfo } from "@/components/chat/message-bubble";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  media?: string[];
  timestamp: number;
  type?: string;
  toolCalls?: ToolCallInfo[];
}

let msgCounter = 0;
function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${++msgCounter}`;
}

export function useChat(sessionKey: string, chatId?: string) {
  const wsSessionId = chatId || sessionKey;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WSClient | null>(null);

  useEffect(() => {
    let stale = false;
    setMessages([]);
    setIsLoading(false);
    setError(null);

    apiClient
      .getSession(sessionKey)
      .then((detail) => {
        if (stale) return;
        if (detail?.messages?.length) {
          const history: ChatMessage[] = detail.messages.map((m, i) => ({
            id: `hist-${i}`,
            role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.content,
            media: m.media,
            timestamp: m.timestamp ? new Date(m.timestamp).getTime() : Date.now(),
          }));
          setMessages(history);
        }
      })
      .catch(() => {});

    const httpBase = apiClient.getBase();
    const wsBase = httpBase.replace(/^http/, "ws");
    const ws = new WSClient(wsSessionId, wsBase);
    wsRef.current = ws;

    const unsub = ws.onEvent((event: WSEvent) => {
      if (event.type === "pong") return;

      if (event.type === "tool_hint" || event.type === "tool_start") {
        const toolName =
          (event.metadata?.tool_name as string) ||
          (event.metadata?.name as string) ||
          event.content ||
          "tool";
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const existing = last.toolCalls || [];
            const already = existing.find((t) => t.name === toolName);
            if (!already) {
              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  toolCalls: [...existing, { name: toolName, status: "running" as const }],
                },
              ];
            }
          }
          return prev;
        });
        return;
      }

      if (event.type === "tool_done") {
        const toolName =
          (event.metadata?.tool_name as string) ||
          (event.metadata?.name as string) ||
          event.content ||
          "tool";
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.toolCalls) {
            const updated = last.toolCalls.map((t) =>
              t.name === toolName ? { ...t, status: "done" as const } : t,
            );
            return [...prev.slice(0, -1), { ...last, toolCalls: updated }];
          }
          return prev;
        });
        return;
      }

      if (event.type === "progress") {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.type === "progress") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: event.content || "" },
            ];
          }
          return [
            ...prev,
            {
              id: nextId("progress"),
              role: "assistant",
              content: event.content || "",
              timestamp: event.timestamp || Date.now(),
              type: "progress",
            },
          ];
        });
        return;
      }

      if (event.type === "message") {
        setIsLoading(false);
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.type !== "progress");
          const lastAssistant = filtered[filtered.length - 1];
          const toolCalls = lastAssistant?.toolCalls;

          return [
            ...filtered,
            {
              id: nextId("msg"),
              role: "assistant",
              content: event.content || "",
              media: event.media,
              timestamp: event.timestamp || Date.now(),
              toolCalls: toolCalls
                ? toolCalls.map((t) => ({ ...t, status: "done" as const }))
                : undefined,
            },
          ];
        });
      }
    });

    ws.connect();

    const checkInterval = setInterval(() => {
      const connected = ws.connected;
      setIsConnected(connected);
      if (!connected) {
        setError("Disconnected from server");
      } else {
        setError(null);
      }
    }, 1000);

    return () => {
      stale = true;
      unsub();
      clearInterval(checkInterval);
      ws.disconnect();
    };
  }, [sessionKey, wsSessionId]);

  const sendMessage = useCallback(
    (content: string, media?: string[]) => {
      if (!wsRef.current) return;

      setMessages((prev) => [
        ...prev,
        {
          id: nextId("user"),
          role: "user",
          content,
          media,
          timestamp: Date.now(),
        },
      ]);
      setIsLoading(true);
      setError(null);
      wsRef.current.sendMessage(content, media);
    },
    [],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearMessages, isConnected, isLoading, error };
}
