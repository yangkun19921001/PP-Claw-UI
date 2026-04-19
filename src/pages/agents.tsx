import { useState } from "react";
import { useAgents, useAgent, useSwitchModel } from "@/hooks/use-agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bot, RefreshCw } from "lucide-react";

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents();
  const switchModel = useSwitchModel();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modelInput, setModelInput] = useState("");
  const [showSwitch, setShowSwitch] = useState(false);

  const { data: detail } = useAgent(selectedId || "");

  const handleSwitch = async () => {
    if (!selectedId || !modelInput.trim()) return;
    try {
      await switchModel.mutateAsync({ agentId: selectedId, model: modelInput.trim() });
      toast.success(`Model switched to ${modelInput}`);
      setShowSwitch(false);
      setModelInput("");
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage agents</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent) => (
            <Card
              key={agent.id}
              className="cursor-pointer hover:shadow-elevated transition-shadow"
              onClick={() => setSelectedId(agent.id)}
            >
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-sm">{agent.name || agent.id}</CardTitle>
                  <p className="text-xs text-muted-foreground">{agent.id}</p>
                </div>
                {agent.default && <Badge variant="secondary">Default</Badge>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{agent.model}</span>
                  <Badge variant={agent.loaded ? "success" : "outline"}>
                    {agent.loaded ? "Active" : "Idle"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(agent.id);
                    setModelInput(agent.model);
                    setShowSwitch(true);
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Switch Model
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {detail && selectedId && !showSwitch && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Detail: {selectedId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(detail).map(([key, val]) => (
                <div key={key}>
                  <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                  <p className="font-medium">{String(val)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showSwitch} onOpenChange={setShowSwitch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Model — {selectedId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>New Model</Label>
            <Input
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="e.g. gpt-4o, claude-3-opus"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwitch(false)}>Cancel</Button>
            <Button onClick={handleSwitch} disabled={switchModel.isPending}>
              Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
