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
import { useI18n } from "@/lib/i18n";

const navItems = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/chat", labelKey: "nav.chat", icon: MessageSquare },
  { to: "/config", labelKey: "nav.config", icon: Settings2 },
  { to: "/agents", labelKey: "nav.agents", icon: Bot },
  { to: "/tools", labelKey: "nav.tools", icon: Wrench },
  { to: "/channels", labelKey: "nav.channels", icon: Radio },
  { to: "/cron", labelKey: "nav.cron", icon: Clock },
  { to: "/skills", labelKey: "nav.skills", icon: BookOpen },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
] as const;

export function Sidebar() {
  const { t } = useI18n();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="drag-region flex h-14 items-center pl-20 pr-4">
        <span className="no-drag text-base font-bold text-brand">{t("brand.name")}</span>
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
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <Separator />
      <ConnectionStatus />
    </aside>
  );
}
