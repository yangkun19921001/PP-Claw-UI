import { useSystemStatus } from "@/hooks/use-system";
import { useAgents } from "@/hooks/use-agents";
import { useCronJobs } from "@/hooks/use-cron";
import { useTools } from "@/hooks/use-tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bot, Clock, Wrench, Zap } from "lucide-react";
import { translateMode, useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const { data: status, isLoading, isError } = useSystemStatus();
  const { data: agents } = useAgents();
  const { data: cronJobs } = useCronJobs();
  const { data: tools } = useTools();
  const { language, t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">{t("dashboard.loading")}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-error">{t("dashboard.failed")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.ensureRunning")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.status")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="success">{t("common.online")}</Badge>
              <span className="text-xs text-muted-foreground">
                {translateMode(language, status?.mode)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("dashboard.uptime", { minutes: Math.floor((status?.uptime_s || 0) / 60) })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.model")}</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold truncate">{status?.model}</p>
            <p className="text-xs text-muted-foreground">
              v{status?.version}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.agents")}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{agents?.length || 0}</p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.loaded", { count: agents?.filter((a) => a.loaded).length || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.tools")}</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tools?.length || 0}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.registered")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              {t("dashboard.agents")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agents && agents.length > 0 ? (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{agent.name || agent.id}</p>
                      <p className="text-xs text-muted-foreground">{agent.model}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.default && <Badge variant="secondary">{t("common.default")}</Badge>}
                      <Badge variant={agent.loaded ? "success" : "outline"}>
                        {agent.loaded ? t("common.loaded") : t("common.idle")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noAgents")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("dashboard.cronJobs")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cronJobs && cronJobs.length > 0 ? (
              <div className="space-y-3">
                {cronJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{job.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {job.payload.message}
                      </p>
                    </div>
                    <Badge variant={job.enabled ? "success" : "outline"}>
                      {job.enabled ? t("common.active") : t("common.disabled")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("dashboard.noCron")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
