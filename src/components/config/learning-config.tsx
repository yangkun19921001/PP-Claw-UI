import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { LearningConfig } from "@/types/api";

interface LearningConfigProps {
  value: LearningConfig | undefined;
  onChange: (value: LearningConfig) => void;
}

export function LearningConfigEditor({ value, onChange }: LearningConfigProps) {
  const cfg: LearningConfig = value || { enabled: false };

  const update = (patch: Partial<LearningConfig>) => onChange({ ...cfg, ...patch });

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-2">
        <Switch checked={cfg.enabled} onCheckedChange={(enabled) => update({ enabled })} />
        <Label>Enable Learning</Label>
      </div>

      {cfg.enabled && (
        <>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Skill Extraction</h4>
            <div>
              <Label>Review Interval</Label>
              <Input
                value={cfg.skill_extraction?.review_interval || ""}
                onChange={(e) =>
                  update({ skill_extraction: { ...cfg.skill_extraction, review_interval: e.target.value } })
                }
                placeholder="24h"
              />
            </div>
            <div>
              <Label>Min Conversation Length</Label>
              <Input
                type="number"
                value={cfg.skill_extraction?.min_conversation_length || 3}
                onChange={(e) =>
                  update({
                    skill_extraction: { ...cfg.skill_extraction, min_conversation_length: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div>
              <Label>Min Tool Calls</Label>
              <Input
                type="number"
                value={cfg.skill_extraction?.min_tool_calls || 1}
                onChange={(e) =>
                  update({ skill_extraction: { ...cfg.skill_extraction, min_tool_calls: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Extractor Model</Label>
              <Input
                value={cfg.skill_extraction?.extractor_model || ""}
                onChange={(e) =>
                  update({ skill_extraction: { ...cfg.skill_extraction, extractor_model: e.target.value } })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Storage</h4>
            <div>
              <Label>Type</Label>
              <Input
                value={cfg.storage?.type || "file"}
                onChange={(e) => update({ storage: { ...cfg.storage, type: e.target.value } })}
              />
            </div>
            <div>
              <Label>Path</Label>
              <Input
                value={cfg.storage?.path || ""}
                onChange={(e) => update({ storage: { ...cfg.storage, path: e.target.value } })}
              />
            </div>
            <div>
              <Label>Max Skills</Label>
              <Input
                type="number"
                value={cfg.storage?.max_skills || 100}
                onChange={(e) => update({ storage: { ...cfg.storage, max_skills: Number(e.target.value) } })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Injection</h4>
            <div>
              <Label>Max Inject Skills</Label>
              <Input
                type="number"
                value={cfg.injection?.max_inject_skills || 3}
                onChange={(e) =>
                  update({ injection: { ...cfg.injection, max_inject_skills: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Similarity Threshold</Label>
              <Input
                type="number"
                step="0.1"
                value={cfg.injection?.similarity_threshold || 0.7}
                onChange={(e) =>
                  update({ injection: { ...cfg.injection, similarity_threshold: Number(e.target.value) } })
                }
              />
            </div>
            <div>
              <Label>Cache Expire (seconds)</Label>
              <Input
                type="number"
                value={cfg.injection?.cache_expire_seconds || 3600}
                onChange={(e) =>
                  update({ injection: { ...cfg.injection, cache_expire_seconds: Number(e.target.value) } })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={cfg.injection?.enable_semantic_match ?? true}
                onCheckedChange={(checked) =>
                  update({ injection: { ...cfg.injection, enable_semantic_match: checked } })
                }
              />
              <Label>Enable Semantic Match</Label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
