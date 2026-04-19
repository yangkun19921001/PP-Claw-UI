import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyValueEditor } from "./key-value-editor";
import type { ProvidersConfig } from "@/types/api";

interface ProvidersConfigProps {
  value: ProvidersConfig;
  onChange: (value: ProvidersConfig) => void;
}

const PROVIDER_NAMES = [
  "openai", "anthropic", "deepseek", "gemini", "groq", "zhipu",
  "dashscope", "ollama", "moonshot", "minimax", "aihubmix",
  "siliconflow", "volcengine", "openrouter", "openai_codex",
  "github_copilot", "azure_openai", "vllm", "custom",
];

export function ProvidersConfigEditor({ value, onChange }: ProvidersConfigProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateProvider = (name: string, patch: Record<string, unknown>) => {
    onChange({
      ...value,
      [name]: { ...(value[name] || {}), ...patch },
    });
  };

  const configuredProviders = PROVIDER_NAMES.filter((n) => value[n]);
  const unconfiguredProviders = PROVIDER_NAMES.filter((n) => !value[n]);

  return (
    <div className="space-y-4">
      {configuredProviders.map((name) => {
        const provider = value[name] || {};
        return (
          <Card key={name}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpanded(expanded === name ? null : name)}
            >
              <CardTitle className="text-sm capitalize">{name.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            {expanded === name && (
              <CardContent className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={provider.api_key || ""}
                    onChange={(e) => updateProvider(name, { api_key: e.target.value })}
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <Label>Base URL</Label>
                  <Input
                    value={provider.base_url || provider.api_base || ""}
                    onChange={(e) => updateProvider(name, { base_url: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={provider.model || provider.default_model || ""}
                    onChange={(e) => updateProvider(name, { model: e.target.value })}
                  />
                </div>
                {name === "azure_openai" && (
                  <div>
                    <Label>API Version</Label>
                    <Input
                      value={provider.api_version || ""}
                      onChange={(e) => updateProvider(name, { api_version: e.target.value })}
                      placeholder="2024-02-01"
                    />
                  </div>
                )}
                <div>
                  <Label>Extra Headers</Label>
                  <KeyValueEditor
                    value={(provider.extra_headers || {}) as Record<string, string>}
                    onChange={(headers) => updateProvider(name, { extra_headers: headers })}
                    keyPlaceholder="Header name"
                    valuePlaceholder="Header value"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {unconfiguredProviders.length > 0 && (
        <div>
          <Label className="text-xs text-muted-foreground">Add Provider</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {unconfiguredProviders.map((name) => (
              <button
                key={name}
                className="rounded-md border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                onClick={() => updateProvider(name, { api_key: "" })}
              >
                + {name.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
