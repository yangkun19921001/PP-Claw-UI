import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { AgentsConfig, AgentEntry, AgentBinding } from "@/types/api";

interface AgentsConfigProps {
  value: AgentsConfig;
  onChange: (value: AgentsConfig) => void;
}

const EMPTY_DEFAULTS = {
  workspace: "", model: "", max_tokens: 4096, temperature: 0.7,
  max_tool_iterations: 10, memory_window: 20, context_window_tokens: 32768,
};

function StringListInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            className="h-8 text-xs"
            value={item}
            onChange={(e) => {
              const updated = [...value];
              updated[i] = e.target.value;
              onChange(updated);
            }}
            placeholder={placeholder}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-3 w-3 text-error" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={() => onChange([...value, ""])}
      >
        <Plus className="h-3 w-3 mr-1" /> Add
      </Button>
    </div>
  );
}

function BindingEditor({
  bindings,
  onChange,
}: {
  bindings: AgentBinding[];
  onChange: (v: AgentBinding[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const addBinding = () => {
    onChange([
      ...bindings,
      { agent_id: "", channel: "", default: false },
    ]);
    setExpandedIdx(bindings.length);
  };

  const updateBinding = (index: number, patch: Partial<AgentBinding>) => {
    const updated = [...bindings];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeBinding = (index: number) => {
    onChange(bindings.filter((_, i) => i !== index));
    if (expandedIdx === index) setExpandedIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Bindings</h3>
        <Button variant="outline" size="sm" onClick={addBinding}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Binding
        </Button>
      </div>

      {bindings.map((binding, i) => (
        <Card key={i} className="border-dashed">
          <CardHeader
            className="cursor-pointer py-2 px-3"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {expandedIdx === i ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <CardTitle className="text-xs">
                  {binding.agent_id || "unassigned"} → {binding.channel || "any"}{" "}
                  {binding.default && (
                    <span className="text-muted-foreground">(default)</span>
                  )}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); removeBinding(i); }}
              >
                <Trash2 className="h-3.5 w-3.5 text-error" />
              </Button>
            </div>
          </CardHeader>
          {expandedIdx === i && (
            <CardContent className="grid grid-cols-2 gap-3 px-3 pb-3 pt-0">
              <div>
                <Label className="text-xs">Agent ID</Label>
                <Input
                  className="h-8 text-xs"
                  value={binding.agent_id}
                  onChange={(e) => updateBinding(i, { agent_id: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Channel</Label>
                <Input
                  className="h-8 text-xs"
                  value={binding.channel}
                  onChange={(e) => updateBinding(i, { channel: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Account ID</Label>
                <Input
                  className="h-8 text-xs"
                  value={binding.account_id || ""}
                  onChange={(e) => updateBinding(i, { account_id: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch
                  checked={binding.default}
                  onCheckedChange={(checked) => updateBinding(i, { default: checked })}
                />
                <Label className="text-xs">Default</Label>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Chat IDs</Label>
                <StringListInput
                  value={binding.chat_ids || []}
                  onChange={(chat_ids) => updateBinding(i, { chat_ids })}
                  placeholder="Chat ID"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Sender IDs</Label>
                <StringListInput
                  value={binding.sender_ids || []}
                  onChange={(sender_ids) => updateBinding(i, { sender_ids })}
                  placeholder="Sender ID"
                />
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {bindings.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">
          No bindings configured. Bindings route messages from specific channels/accounts to agents.
        </p>
      )}
    </div>
  );
}

export function AgentsConfigEditor({ value: rawValue, onChange }: AgentsConfigProps) {
  const value = rawValue || { defaults: EMPTY_DEFAULTS, list: [], bindings: [] };
  const defaults = value.defaults || EMPTY_DEFAULTS;
  const list = value.list || [];
  const bindings = value.bindings || [];
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateDefaults = (key: string, val: unknown) => {
    onChange({
      ...value,
      defaults: { ...defaults, [key]: val },
    });
  };

  const updateAgent = (index: number, patch: Partial<AgentEntry>) => {
    const updated = [...list];
    updated[index] = { ...updated[index], ...patch };
    onChange({ ...value, list: updated });
  };

  const removeAgent = (index: number) => {
    onChange({ ...value, list: list.filter((_, i) => i !== index) });
  };

  const addAgent = () => {
    onChange({
      ...value,
      list: [
        ...list,
        {
          id: `agent-${Date.now()}`,
          name: "New Agent",
          default: false,
          model: defaults.model,
          workspace: defaults.workspace,
          max_tokens: defaults.max_tokens,
          temperature: defaults.temperature,
          max_tool_iterations: defaults.max_tool_iterations,
          memory_window: defaults.memory_window,
          context_window_tokens: defaults.context_window_tokens,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Workspace</Label>
            <Input
              value={defaults.workspace}
              onChange={(e) => updateDefaults("workspace", e.target.value)}
            />
          </div>
          <div>
            <Label>Model</Label>
            <Input
              value={defaults.model}
              onChange={(e) => updateDefaults("model", e.target.value)}
            />
          </div>
          <div>
            <Label>Max Tokens</Label>
            <Input
              type="number"
              value={defaults.max_tokens}
              onChange={(e) => updateDefaults("max_tokens", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Temperature</Label>
            <Input
              type="number"
              step="0.1"
              value={defaults.temperature}
              onChange={(e) => updateDefaults("temperature", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Max Tool Iterations</Label>
            <Input
              type="number"
              value={defaults.max_tool_iterations}
              onChange={(e) => updateDefaults("max_tool_iterations", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Memory Window</Label>
            <Input
              type="number"
              value={defaults.memory_window}
              onChange={(e) => updateDefaults("memory_window", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Context Window Tokens</Label>
            <Input
              type="number"
              value={defaults.context_window_tokens}
              onChange={(e) => updateDefaults("context_window_tokens", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Agent List</h3>
        <Button variant="outline" size="sm" onClick={addAgent}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Agent
        </Button>
      </div>

      <div className="space-y-3">
        {list?.map((agent, i) => (
          <Card key={agent.id}>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {expanded === agent.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <CardTitle className="text-sm">
                    {agent.name || agent.id}
                    {agent.default && (
                      <span className="ml-2 text-xs text-muted-foreground">(default)</span>
                    )}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAgent(i);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-error" />
                </Button>
              </div>
            </CardHeader>
            {expanded === agent.id && (
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID</Label>
                  <Input
                    value={agent.id}
                    onChange={(e) => updateAgent(i, { id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={agent.name}
                    onChange={(e) => updateAgent(i, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={agent.model}
                    onChange={(e) => updateAgent(i, { model: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={agent.max_tokens}
                    onChange={(e) => updateAgent(i, { max_tokens: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={agent.temperature}
                    onChange={(e) => updateAgent(i, { temperature: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max Tool Iterations</Label>
                  <Input
                    type="number"
                    value={agent.max_tool_iterations}
                    onChange={(e) => updateAgent(i, { max_tool_iterations: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Switch
                    checked={agent.default}
                    onCheckedChange={(checked) => updateAgent(i, { default: checked })}
                  />
                  <Label>Default Agent</Label>
                </div>
                <div className="col-span-2">
                  <Label>Tools Include</Label>
                  <StringListInput
                    value={agent.tools?.include || []}
                    onChange={(include) =>
                      updateAgent(i, {
                        tools: { ...agent.tools, include, exclude: agent.tools?.exclude || [] },
                      })
                    }
                    placeholder="Tool name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tools Exclude</Label>
                  <StringListInput
                    value={agent.tools?.exclude || []}
                    onChange={(exclude) =>
                      updateAgent(i, {
                        tools: { ...agent.tools, include: agent.tools?.include || [], exclude },
                      })
                    }
                    placeholder="Tool name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Delegates To</Label>
                  <StringListInput
                    value={agent.delegates_to || []}
                    onChange={(delegates_to) => updateAgent(i, { delegates_to })}
                    placeholder="Agent ID"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <BindingEditor
        bindings={bindings}
        onChange={(newBindings) => onChange({ ...value, bindings: newBindings })}
      />
    </div>
  );
}
