import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Bot,
  Wrench,
  Radio,
  Clock,
  BookOpen,
  Settings,
} from "lucide-react";
import { ConnectionStatus } from "./connection-status";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/config", label: "Config", icon: Settings2 },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/channels", label: "Channels", icon: Radio },
  { to: "/cron", label: "Cron Jobs", icon: Clock },
  { to: "/skills", label: "Skills", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="drag-region flex h-14 items-center pl-20 pr-4">
        <span className="no-drag text-base font-bold text-brand">PP-Claw</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "no-drag flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Separator />
      <ConnectionStatus />
    </aside>
  );
}
