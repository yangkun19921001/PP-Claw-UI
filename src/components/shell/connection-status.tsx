import { cn } from "@/lib/utils";
import { useSystemStatus } from "@/hooks/use-system";

export function ConnectionStatus() {
  const { data, isError, isLoading } = useSystemStatus();

  const connected = !isError && !isLoading && !!data;

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
          ? `${data.mode} - v${data.version}`
          : isLoading
            ? "Connecting..."
            : "Disconnected"}
      </span>
    </div>
  );
}
