import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RLConfig } from "@/types/api";

interface RLConfigProps {
  value: RLConfig | undefined;
  onChange: (value: RLConfig) => void;
}

export function RLConfigEditor({ value, onChange }: RLConfigProps) {
  const cfg: RLConfig = value || { enabled: false };

  const update = (patch: Partial<RLConfig>) => onChange({ ...cfg, ...patch });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Switch checked={cfg.enabled} onCheckedChange={(enabled) => update({ enabled })} />
        <Label>Enable Reinforcement Learning</Label>
      </div>

      {cfg.enabled && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm">Tracking</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Storage Path</Label>
                <Input
                  value={cfg.tracking?.storage_path || ""}
                  onChange={(e) => update({ tracking: { ...cfg.tracking, storage_path: e.target.value } })}
                />
              </div>
              <div>
                <Label>Max Trajectories</Label>
                <Input
                  type="number"
                  value={cfg.tracking?.max_trajectories || 1000}
                  onChange={(e) => update({ tracking: { ...cfg.tracking, max_trajectories: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Retention Days</Label>
                <Input
                  type="number"
                  value={cfg.tracking?.retention_days || 30}
                  onChange={(e) => update({ tracking: { ...cfg.tracking, retention_days: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Flush Interval</Label>
                <Input
                  value={cfg.tracking?.flush_interval || ""}
                  onChange={(e) => update({ tracking: { ...cfg.tracking, flush_interval: e.target.value } })}
                  placeholder="5m"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cfg.tracking?.auto_cleanup ?? true}
                  onCheckedChange={(checked) => update({ tracking: { ...cfg.tracking, auto_cleanup: checked } })}
                />
                <Label>Auto Cleanup</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Compression</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Max Steps</Label>
                <Input
                  type="number"
                  value={cfg.compression?.target_max_steps || 50}
                  onChange={(e) => update({ compression: { ...cfg.compression, target_max_steps: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Strategy</Label>
                <Input
                  value={cfg.compression?.compression_strategy || ""}
                  onChange={(e) => update({ compression: { ...cfg.compression, compression_strategy: e.target.value } })}
                  placeholder="smart"
                />
              </div>
              <div>
                <Label>Model Name</Label>
                <Input
                  value={cfg.compression?.model_name || ""}
                  onChange={(e) => update({ compression: { ...cfg.compression, model_name: e.target.value } })}
                />
              </div>
              <div>
                <Label>Min Compression Ratio</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cfg.compression?.min_compression_ratio || 0.5}
                  onChange={(e) => update({ compression: { ...cfg.compression, min_compression_ratio: Number(e.target.value) } })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Reward</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Success Reward</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cfg.reward?.success_reward || 1.0}
                  onChange={(e) => update({ reward: { ...cfg.reward, success_reward: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Time Penalty Per Step</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cfg.reward?.time_reward?.penalty_per_step || 0.01}
                  onChange={(e) =>
                    update({
                      reward: {
                        ...cfg.reward,
                        time_reward: { ...cfg.reward?.time_reward, penalty_per_step: Number(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Tool Success Bonus</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cfg.reward?.tool_reward?.success_bonus || 0.1}
                  onChange={(e) =>
                    update({
                      reward: {
                        ...cfg.reward,
                        tool_reward: { ...cfg.reward?.tool_reward, success_bonus: Number(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Tool Failure Penalty</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cfg.reward?.tool_reward?.failure_penalty || 0.1}
                  onChange={(e) =>
                    update({
                      reward: {
                        ...cfg.reward,
                        tool_reward: { ...cfg.reward?.tool_reward, failure_penalty: Number(e.target.value) },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Optimization</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Update Interval</Label>
                <Input
                  value={cfg.optimization?.update_interval || ""}
                  onChange={(e) => update({ optimization: { ...cfg.optimization, update_interval: e.target.value } })}
                  placeholder="1h"
                />
              </div>
              <div>
                <Label>Min Trajectories</Label>
                <Input
                  type="number"
                  value={cfg.optimization?.min_trajectories || 10}
                  onChange={(e) => update({ optimization: { ...cfg.optimization, min_trajectories: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Learning Rate</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={cfg.optimization?.learning_rate || 0.001}
                  onChange={(e) => update({ optimization: { ...cfg.optimization, learning_rate: Number(e.target.value) } })}
                />
              </div>
              <div>
                <Label>Exploration Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cfg.optimization?.exploration_rate || 0.1}
                  onChange={(e) => update({ optimization: { ...cfg.optimization, exploration_rate: Number(e.target.value) } })}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
