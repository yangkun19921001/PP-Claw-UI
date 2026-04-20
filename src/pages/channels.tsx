import { useChannelsStatus } from "@/hooks/use-channels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, AlertCircle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface SubAccount {
  account_id?: string;
  active?: boolean;
  logged_in?: boolean;
  base_url?: string;
  last_error?: string;
  paused_until?: string;
  last_seen_at?: string;
  last_message_at?: string;
  [key: string]: unknown;
}

interface AccountStatus {
  account_id?: string;
  enabled?: boolean;
  running?: boolean;
  logged_in?: boolean;
  last_error?: string;
  accounts?: SubAccount[];
  [key: string]: unknown;
}

interface ChannelStatusData {
  enabled?: boolean;
  accounts?: Record<string, AccountStatus>;
}

function flattenAccounts(accounts: Record<string, AccountStatus>): { id: string; status: AccountStatus }[] {
  const result: { id: string; status: AccountStatus }[] = [];
  for (const [id, acct] of Object.entries(accounts)) {
    if (acct.accounts && Array.isArray(acct.accounts)) {
      for (const sub of acct.accounts) {
        result.push({
          id: sub.account_id || id,
          status: {
            ...sub,
            enabled: acct.enabled ?? sub.active,
            running: sub.active,
            logged_in: sub.logged_in,
          },
        });
      }
    } else {
      result.push({ id, status: acct });
    }
  }
  return result;
}

function formatTime(ts?: string): string {
  if (!ts || ts.startsWith("0001")) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

export default function ChannelsPage() {
  const { data, isLoading, isError, error } = useChannelsStatus();
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            {t("channels.failed", {
              error: error instanceof Error ? error.message : "Unknown error",
            })}
          </p>
        </div>
      </div>
    );
  }

  const isAgentMode =
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string";

  if (isAgentMode) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("channels.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("channels.subtitle")}
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {(data as { message: string }).message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channels = (data || {}) as Record<string, ChannelStatusData>;
  const channelEntries = Object.entries(channels).filter(
    ([key]) => key !== "mode" && key !== "message",
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("channels.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("channels.subtitle")}
        </p>
      </div>

      {channelEntries.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {t("channels.none")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channelEntries.map(([name, ch]) => {
            const rawAccounts = ch.accounts || {};
            const flatAccounts = flattenAccounts(rawAccounts);
            const isExpanded = expandedChannel === name;

            return (
              <Card key={name}>
                <CardHeader
                  className="flex flex-row items-center gap-3 cursor-pointer"
                  onClick={() =>
                    setExpandedChannel(isExpanded ? null : name)
                  }
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Radio className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm capitalize">
                      {name.replace(/_/g, " ")}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("channels.accountCount", { count: flatAccounts.length })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ch.enabled ? "success" : "outline"}>
                      {ch.enabled ? t("common.enabled") : t("common.disabled")}
                    </Badge>
                    {flatAccounts.length > 0 &&
                      (isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ))}
                  </div>
                </CardHeader>

                {isExpanded && flatAccounts.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {flatAccounts.map((entry, idx) => (
                        <div
                          key={`${entry.id}-${idx}`}
                          className="rounded-lg bg-surface-1 px-3 py-2 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  entry.status.running || entry.status.logged_in
                                    ? "bg-success"
                                    : entry.status.enabled
                                      ? "bg-warning"
                                      : "bg-muted-foreground"
                                }`}
                              />
                              <span className="font-mono font-medium">
                                {entry.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {entry.status.running !== undefined && (
                                <span>
                                  {entry.status.running ? t("channels.running") : t("channels.stopped")}
                                </span>
                              )}
                              {entry.status.logged_in !== undefined && (
                                <span>
                                  {entry.status.logged_in ? t("channels.loggedIn") : t("channels.notLoggedIn")}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Extra details for wechat-style sub-accounts */}
                          {(entry.status as SubAccount).base_url && (
                            <div className="text-muted-foreground truncate">
                              {(entry.status as SubAccount).base_url}
                            </div>
                          )}
                          {(entry.status as SubAccount).last_seen_at && (
                            <div className="text-muted-foreground">
                              {t("channels.lastSeen", {
                                time: formatTime((entry.status as SubAccount).last_seen_at),
                              })}
                            </div>
                          )}
                          {(entry.status as SubAccount).paused_until &&
                            !(entry.status as SubAccount).paused_until!.startsWith("0001") && (
                            <div className="text-warning">
                              {t("channels.pausedUntil", {
                                time: formatTime((entry.status as SubAccount).paused_until),
                              })}
                            </div>
                          )}
                          {entry.status.last_error && (
                            <div className="text-error truncate" title={entry.status.last_error}>
                              {entry.status.last_error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
