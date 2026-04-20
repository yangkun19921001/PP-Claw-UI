import { cn } from "@/lib/utils";
import { useSystemStatus } from "@/hooks/use-system";
import { translateMode, useI18n } from "@/lib/i18n";

export function ConnectionStatus() {
  const { data, isError, isLoading } = useSystemStatus();
  const { language, t } = useI18n();

  const connected = !isError && !isLoading && !!data;
  const modeLabel = translateMode(language, data?.mode);

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connected ? "bg-success" : "bg-error",
        )}
      />
      <span className="text-muted-foreground">
        {connected
          ? t("connection.status", { mode: modeLabel, version: data?.version })
          : isLoading
            ? t("common.connecting")
            : t("common.disconnected")}
      </span>
    </div>
  );
}
