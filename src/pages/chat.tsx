import { useParams } from "react-router-dom";
import { ChatView } from "@/components/chat/chat-view";
import { useSessions } from "@/hooks/use-sessions";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(ts?: string) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const { sessionKey } = useParams();
  const { data: sessions } = useSessions();

  return (
    <div className="flex h-full">
      <div className="w-60 border-r border-border bg-surface-1 flex flex-col shrink-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-medium">Sessions</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <NavLink to="/chat">
              <Plus className="h-4 w-4" />
            </NavLink>
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-0.5">
          <NavLink
            to="/chat"
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive && !sessionKey
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-2/50",
              )
            }
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </NavLink>

          {[...(sessions || [])].sort((a, b) => {
            const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return tb - ta;
          }).map((s) => {
            const time = formatTime(s.updated_at);
            return (
              <NavLink
                key={s.key}
                to={`/chat/${encodeURIComponent(s.key)}`}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-2/50",
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1">{s.key}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 ml-5.5 text-[10px] text-muted-foreground">
                  {s.messages !== undefined && (
                    <span>{s.messages} msgs</span>
                  )}
                  {time && (
                    <>
                      <Clock className="h-2.5 w-2.5" />
                      <span>{time}</span>
                    </>
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <ChatView sessionKey={sessionKey} />
      </div>
    </div>
  );
}
