import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { GatewayConfig } from "@/types/api";

interface GatewayConfigProps {
  value: GatewayConfig;
  onChange: (value: GatewayConfig) => void;
}

export function GatewayConfigEditor({ value, onChange }: GatewayConfigProps) {
  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <Label>Host</Label>
        <Input
          value={value.host}
          onChange={(e) => onChange({ ...value, host: e.target.value })}
          placeholder="0.0.0.0"
        />
      </div>
      <div>
        <Label>Port</Label>
        <Input
          type="number"
          value={value.port}
          onChange={(e) => onChange({ ...value, port: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-medium">Heartbeat</h4>
        <div className="flex items-center gap-2">
          <Switch
            checked={value.heartbeat?.enabled ?? false}
            onCheckedChange={(checked) =>
              onChange({
                ...value,
                heartbeat: { ...value.heartbeat, enabled: checked, interval_s: value.heartbeat?.interval_s ?? 30 },
              })
            }
          />
          <Label>Enable Heartbeat</Label>
        </div>
        {value.heartbeat?.enabled && (
          <div>
            <Label>Interval (seconds)</Label>
            <Input
              type="number"
              value={value.heartbeat.interval_s}
              onChange={(e) =>
                onChange({
                  ...value,
                  heartbeat: { ...value.heartbeat!, interval_s: Number(e.target.value) },
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
