import { cn } from "@/lib/utils";
import { Bot, User, CheckCircle2, Loader2, Wrench, FileText, Download } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";
import apiClient from "@/lib/api-client";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico"]);
function isImageFile(url: string): boolean {
  const ext = url.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTS.has(`.${ext}`) : false;
}

export interface ToolCallInfo {
  name: string;
  status: "running" | "done";
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  media?: string[];
  type?: string;
  timestamp: number;
  toolCalls?: ToolCallInfo[];
}

function formatToolName(name: string): string {
  return name
    .split(/[_\-\s]+/)
    .map((word) => {
      const upper = word.toUpperCase();
      if (["API", "DB", "SQL", "UI", "URL", "HTTP", "MCP", "LLM", "OCR"].includes(upper)) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function MessageBubble({
  role,
  content,
  media,
  type,
  timestamp,
  toolCalls,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const isProgress = type === "progress";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-surface-2 text-text-secondary",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("max-w-[70%] space-y-2", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-[20px] px-4 py-2.5",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-surface-1 border border-border text-text-primary rounded-tl-sm",
            isProgress && "opacity-60 italic",
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <ChatMarkdown
              content={content}
              className={isProgress ? "opacity-80" : undefined}
            />
          )}

          {media && media.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {media.map((url, i) => {
                const resolvedUrl = url.startsWith("http") ? url : apiClient.getFileURL(url);
                const fileName = url.split("/").pop() || url;
                if (isImageFile(url)) {
                  return (
                    <img
                      key={i}
                      src={resolvedUrl}
                      alt=""
                      className="max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(resolvedUrl)}
                    />
                  );
                }
                return (
                  <a
                    key={i}
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-0 px-3 py-2 text-xs hover:bg-surface-1 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px]">{fileName}</span>
                    <Download className="h-3 w-3 text-muted-foreground shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {toolCalls && toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolCalls.map((tool, i) => (
              <div
                key={i}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border",
                  tool.status === "done"
                    ? "border-success/30 bg-success/5 text-success"
                    : "border-warning/30 bg-warning/5 text-warning",
                )}
              >
                {tool.status === "done" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                <Wrench className="h-3 w-3" />
                <span>{formatToolName(tool.name)}</span>
              </div>
            ))}
          </div>
        )}

        <p
          className={cn(
            "text-[10px] px-1",
            isUser ? "text-right text-muted-foreground" : "text-muted-foreground",
          )}
        >
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
