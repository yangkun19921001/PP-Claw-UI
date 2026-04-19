import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyValueEditor } from "./key-value-editor";
import { Plus, Trash2 } from "lucide-react";
import type { ToolsConfig, MCPServerConfig } from "@/types/api";

interface ToolsConfigProps {
  value: ToolsConfig;
  onChange: (value: ToolsConfig) => void;
}

export function ToolsConfigEditor({ value, onChange }: ToolsConfigProps) {
  const [newMcpName, setNewMcpName] = useState("");
  const [expandedMcp, setExpandedMcp] = useState<string | null>(null);

  const mcpServers = value.mcp_servers || {};

  const updateMcp = (name: string, patch: Partial<MCPServerConfig>) => {
    onChange({
      ...value,
      mcp_servers: {
        ...mcpServers,
        [name]: { ...mcpServers[name], ...patch },
      },
    });
  };

  const removeMcp = (name: string) => {
    const next = { ...mcpServers };
    delete next[name];
    onChange({ ...value, mcp_servers: next });
  };

  const addMcp = () => {
    if (!newMcpName.trim()) return;
    onChange({
      ...value,
      mcp_servers: {
        ...mcpServers,
        [newMcpName.trim()]: { command: "" },
      },
    });
    setNewMcpName("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-w-lg">
        <h4 className="text-sm font-medium">Web Search</h4>
        <div>
          <Label>API Key</Label>
          <Input
            type="password"
            value={value.web?.search?.api_key || ""}
            onChange={(e) =>
              onChange({
                ...value,
                web: { ...value.web, search: { ...value.web?.search, api_key: e.target.value } },
              })
            }
          />
        </div>
        <div>
          <Label>Max Results</Label>
          <Input
            type="number"
            value={value.web?.search?.max_results || 5}
            onChange={(e) =>
              onChange({
                ...value,
                web: { ...value.web, search: { ...value.web?.search, max_results: Number(e.target.value) } },
              })
            }
          />
        </div>

        <h4 className="text-sm font-medium pt-2">Execution</h4>
        <div>
          <Label>Timeout</Label>
          <Input
            value={value.exec?.timeout || ""}
            onChange={(e) => onChange({ ...value, exec: { ...value.exec, timeout: e.target.value } })}
            placeholder="30s"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={value.restrict_to_workspace ?? false}
            onCheckedChange={(checked) => onChange({ ...value, restrict_to_workspace: checked })}
          />
          <Label>Restrict to Workspace</Label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">MCP Servers</h4>
          <div className="flex items-center gap-2">
            <Input
              value={newMcpName}
              onChange={(e) => setNewMcpName(e.target.value)}
              placeholder="Server name"
              className="w-40 h-8 text-xs"
            />
            <Button variant="outline" size="sm" onClick={addMcp}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(mcpServers).map(([name, cfg]) => (
            <Card key={name}>
              <CardHeader
                className="cursor-pointer py-3"
                onClick={() => setExpandedMcp(expandedMcp === name ? null : name)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); removeMcp(name); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  </Button>
                </div>
              </CardHeader>
              {expandedMcp === name && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>Command</Label>
                    <Input
                      value={cfg.command || ""}
                      onChange={(e) => updateMcp(name, { command: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Args (comma-separated)</Label>
                    <Input
                      value={(cfg.args || []).join(", ")}
                      onChange={(e) =>
                        updateMcp(name, { args: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                      }
                    />
                  </div>
                  <div>
                    <Label>URL (for SSE)</Label>
                    <Input
                      value={cfg.url || ""}
                      onChange={(e) => updateMcp(name, { url: e.target.value })}
                      placeholder="http://..."
                    />
                  </div>
                  <div>
                    <Label>Tool Timeout</Label>
                    <Input
                      value={cfg.tool_timeout || ""}
                      onChange={(e) => updateMcp(name, { tool_timeout: e.target.value })}
                      placeholder="30s"
                    />
                  </div>
                  <div>
                    <Label>Environment Variables</Label>
                    <KeyValueEditor
                      value={cfg.env || {}}
                      onChange={(env) => updateMcp(name, { env })}
                      keyPlaceholder="VAR_NAME"
                      valuePlaceholder="value"
                    />
                  </div>
                  <div>
                    <Label>Headers</Label>
                    <KeyValueEditor
                      value={cfg.headers || {}}
                      onChange={(headers) => updateMcp(name, { headers })}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
