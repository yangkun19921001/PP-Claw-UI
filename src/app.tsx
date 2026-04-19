import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/shell/app-shell";
import DashboardPage from "@/pages/dashboard";
import ChatPage from "@/pages/chat";
import ConfigPage from "@/pages/config";
import AgentsPage from "@/pages/agents";
import ToolsPage from "@/pages/tools";
import ChannelsPage from "@/pages/channels";
import CronPage from "@/pages/cron";
import SkillsPage from "@/pages/skills";
import SettingsPage from "@/pages/settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:sessionKey" element={<ChatPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/cron" element={<CronPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
