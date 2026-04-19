import { useState } from "react";
import { useConfig, useUpdateConfig } from "@/hooks/use-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AgentsConfigEditor } from "@/components/config/agents-config";
import { ProvidersConfigEditor } from "@/components/config/providers-config";
import { ChannelsConfigEditor } from "@/components/config/channels-config";
import { GatewayConfigEditor } from "@/components/config/gateway-config";
import { ToolsConfigEditor } from "@/components/config/tools-config";
import { LearningConfigEditor } from "@/components/config/learning-config";
import { RLConfigEditor } from "@/components/config/rl-config";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import type { PPClawConfig } from "@/types/api";

export default function ConfigPage() {
  const { data: config, isLoading, isError } = useConfig();
  const updateConfig = useUpdateConfig();
  const [draft, setDraft] = useState<PPClawConfig | null>(null);

  const current = draft || config;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-error">Failed to load configuration</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!draft) return;
    try {
      await updateConfig.mutateAsync(draft);
      setDraft(null);
      toast.success("Configuration saved");
    } catch (err: unknown) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const updateDraft = (patch: Partial<PPClawConfig>) => {
    setDraft({ ...current, ...patch } as PPClawConfig);
  };

  const isDirty = draft !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Configuration</h1>
          <p className="text-sm text-muted-foreground">Manage all PP-Claw settings</p>
        </div>
        {isDirty && (
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="agents">
          <TabsList className="mb-4">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="gateway">Gateway</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="rl">RL</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AgentsConfigEditor
              value={current.agents}
              onChange={(agents) => updateDraft({ agents })}
            />
          </TabsContent>
          <TabsContent value="providers">
            <ProvidersConfigEditor
              value={current.providers}
              onChange={(providers) => updateDraft({ providers })}
            />
          </TabsContent>
          <TabsContent value="channels">
            <ChannelsConfigEditor
              value={current.channels}
              onChange={(channels) => updateDraft({ channels })}
            />
          </TabsContent>
          <TabsContent value="gateway">
            <GatewayConfigEditor
              value={current.gateway}
              onChange={(gateway) => updateDraft({ gateway })}
            />
          </TabsContent>
          <TabsContent value="tools">
            <ToolsConfigEditor
              value={current.tools}
              onChange={(tools) => updateDraft({ tools })}
            />
          </TabsContent>
          <TabsContent value="learning">
            <LearningConfigEditor
              value={current.learning}
              onChange={(learning) => updateDraft({ learning })}
            />
          </TabsContent>
          <TabsContent value="rl">
            <RLConfigEditor
              value={current.rl}
              onChange={(rl) => updateDraft({ rl })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
