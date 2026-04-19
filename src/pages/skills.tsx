import { useState } from "react";
import { useAllSkills, useSkillDetail, useSaveSkill, useDeleteSkill } from "@/hooks/use-skills";
import { useAgents } from "@/hooks/use-agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  BookOpen,
  Loader2,
  AlertCircle,
  Trash2,
  Edit3,
  Eye,
  Plus,
  ChevronDown,
  ChevronRight,
  Tag,
  Zap,
  Package,
  Brain,
  FolderOpen,
} from "lucide-react";
import type { SkillItem, SkillDetail, AgentSkillsResponse } from "@/lib/api-client";

const SOURCE_LABELS: Record<string, { label: string; variant: "default" | "outline" | "success" | "destructive" }> = {
  workspace: { label: "Workspace", variant: "default" },
  builtin: { label: "Built-in", variant: "outline" },
  embedded: { label: "Embedded", variant: "outline" },
  learned: { label: "Learned", variant: "success" },
};

const SOURCE_ICONS: Record<string, typeof BookOpen> = {
  workspace: FolderOpen,
  builtin: Package,
  embedded: Package,
  learned: Brain,
};

export default function SkillsPage() {
  const { data: allSkills, isLoading, isError, error } = useAllSkills();
  const { data: agents } = useAgents();
  const saveSkill = useSaveSkill();
  const deleteSkill = useDeleteSkill();

  const [selectedSkill, setSelectedSkill] = useState<{ agent: string; name: string } | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editSkill, setEditSkill] = useState<{ agent: string; skill: SkillDetail } | null>(null);

  const [createForm, setCreateForm] = useState({
    agentId: "",
    name: "",
    description: "",
    content: "",
    tags: "",
  });

  const agentNames = agents?.reduce(
    (acc, a) => ({ ...acc, [a.id]: a.name || a.id }),
    {} as Record<string, string>,
  ) ?? {};

  const handleCreate = async () => {
    if (!createForm.agentId || !createForm.name || !createForm.content) {
      toast.error("Agent, name, and content are required");
      return;
    }
    try {
      await saveSkill.mutateAsync({
        agentId: createForm.agentId,
        skill: {
          name: createForm.name,
          description: createForm.description,
          content: createForm.content,
          tags: createForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        },
      });
      toast.success("Skill created");
      setShowCreate(false);
      setCreateForm({ agentId: "", name: "", description: "", content: "", tags: "" });
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  const handleDelete = async (agentId: string, name: string) => {
    try {
      await deleteSkill.mutateAsync({ agentId, name });
      toast.success("Skill deleted");
      if (selectedSkill?.agent === agentId && selectedSkill?.name === name) {
        setSelectedSkill(null);
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleSaveEdit = async () => {
    if (!editSkill) return;
    try {
      await saveSkill.mutateAsync({
        agentId: editSkill.agent,
        skill: editSkill.skill,
      });
      toast.success("Skill updated");
      setEditSkill(null);
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Failed to load skills: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const agentSkillsList = allSkills || [];
  const totalBuiltin = agentSkillsList.reduce((n, a) => n + (a.builtin?.length || 0), 0);
  const totalLearned = agentSkillsList.reduce((n, a) => n + (a.learned?.length || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalBuiltin + totalLearned} skills across {agentSkillsList.length} agents
            {totalBuiltin > 0 && (
              <span className="ml-2">
                <Badge variant="outline" className="text-[10px] ml-1">{totalBuiltin} built-in</Badge>
              </span>
            )}
            {totalLearned > 0 && (
              <span className="ml-1">
                <Badge variant="success" className="text-[10px]">{totalLearned} learned</Badge>
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Skill
        </Button>
      </div>

      {agentSkillsList.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No skills found. Built-in skills appear when SKILL.md files are in the workspace or skills directory.
              Learned skills are automatically extracted from conversations when learning is enabled.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agentSkillsList.map((entry) => (
            <AgentSkillsCard
              key={entry.agent_id}
              entry={entry}
              agentName={agentNames[entry.agent_id] || entry.agent_id}
              expanded={expandedAgent === entry.agent_id}
              onToggle={() => setExpandedAgent(expandedAgent === entry.agent_id ? null : entry.agent_id)}
              onView={(name) => setSelectedSkill({ agent: entry.agent_id, name })}
              onDelete={(name) => handleDelete(entry.agent_id, name)}
            />
          ))}
        </div>
      )}

      {/* Skill detail viewer */}
      <SkillViewer
        agentId={selectedSkill?.agent ?? null}
        skillName={selectedSkill?.name ?? null}
        open={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onEdit={(skill) => {
          setSelectedSkill(null);
          setEditSkill({ agent: selectedSkill!.agent, skill });
        }}
      />

      {/* Skill editor */}
      <Dialog open={!!editSkill} onOpenChange={(open) => !open && setEditSkill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Skill: {editSkill?.skill.name}</DialogTitle>
          </DialogHeader>
          {editSkill && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <Label>Description</Label>
                <Input
                  value={editSkill.skill.description}
                  onChange={(e) =>
                    setEditSkill({
                      ...editSkill,
                      skill: { ...editSkill.skill, description: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={editSkill.skill.content}
                  onChange={(e) =>
                    setEditSkill({
                      ...editSkill,
                      skill: { ...editSkill.skill, content: e.target.value },
                    })
                  }
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={(editSkill.skill.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditSkill({
                      ...editSkill,
                      skill: {
                        ...editSkill.skill,
                        tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSkill(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveSkill.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create skill dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Learned Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label>Agent</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={createForm.agentId}
                onChange={(e) => setCreateForm({ ...createForm, agentId: e.target.value })}
              >
                <option value="">Select agent...</option>
                {agents?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name || a.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="skill-name"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="What this skill does"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={createForm.content}
                onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                placeholder="Skill instructions / knowledge..."
                rows={8}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                value={createForm.tags}
                onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                placeholder="tag1, tag2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saveSkill.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentSkillsCard({
  entry,
  agentName,
  expanded,
  onToggle,
  onView,
  onDelete,
}: {
  entry: AgentSkillsResponse;
  agentName: string;
  expanded: boolean;
  onToggle: () => void;
  onView: (name: string) => void;
  onDelete: (name: string) => void;
}) {
  const builtinCount = entry.builtin?.length || 0;
  const learnedCount = entry.learned?.length || 0;

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-sm">{agentName}</CardTitle>
          <div className="flex items-center gap-2 mt-0.5">
            {builtinCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {builtinCount} built-in
              </span>
            )}
            {learnedCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {learnedCount} learned
              </span>
            )}
            {builtinCount === 0 && learnedCount === 0 && (
              <span className="text-xs text-muted-foreground">No skills</span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <Tabs defaultValue={builtinCount > 0 ? "builtin" : "learned"}>
            <TabsList className="mb-3">
              {builtinCount > 0 && (
                <TabsTrigger value="builtin">
                  <Package className="h-3.5 w-3.5 mr-1" />
                  Built-in ({builtinCount})
                </TabsTrigger>
              )}
              {learnedCount > 0 && (
                <TabsTrigger value="learned">
                  <Brain className="h-3.5 w-3.5 mr-1" />
                  Learned ({learnedCount})
                </TabsTrigger>
              )}
            </TabsList>

            {builtinCount > 0 && (
              <TabsContent value="builtin" className="space-y-2 mt-0">
                {entry.builtin.map((skill) => (
                  <SkillItemCard
                    key={skill.name}
                    skill={skill}
                    onView={() => onView(skill.name)}
                  />
                ))}
              </TabsContent>
            )}

            {learnedCount > 0 && (
              <TabsContent value="learned" className="space-y-2 mt-0">
                {entry.learned.map((skill) => (
                  <SkillItemCard
                    key={skill.name}
                    skill={skill}
                    onView={() => onView(skill.name)}
                    onDelete={() => onDelete(skill.name)}
                  />
                ))}
              </TabsContent>
            )}
          </Tabs>

          {builtinCount === 0 && learnedCount === 0 && (
            <p className="text-xs text-muted-foreground py-2">No skills for this agent</p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function SkillItemCard({
  skill,
  onView,
  onDelete,
}: {
  skill: SkillItem;
  onView: () => void;
  onDelete?: () => void;
}) {
  const sourceInfo = SOURCE_LABELS[skill.source] || { label: skill.source, variant: "outline" as const };
  const Icon = SOURCE_ICONS[skill.source] || BookOpen;

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-1 px-3 py-2.5">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{skill.name}</span>
          <Badge variant={sourceInfo.variant} className="text-[10px] h-4 shrink-0">
            {sourceInfo.label}
          </Badge>
          {skill.version && (
            <Badge variant="outline" className="text-[10px] h-4">
              v{skill.version}
            </Badge>
          )}
          {!skill.available && (
            <Badge variant="destructive" className="text-[10px] h-4">
              Unavailable
            </Badge>
          )}
        </div>
        {skill.description && (
          <p className="text-xs text-muted-foreground truncate pl-5">{skill.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pl-5">
          {skill.tags && skill.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {skill.tags.slice(0, 3).join(", ")}
              {skill.tags.length > 3 && ` +${skill.tags.length - 3}`}
            </span>
          )}
          {(skill.usage_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {skill.usage_count} uses
            </span>
          )}
          {(skill.success_rate ?? 0) > 0 && (
            <span>{((skill.success_rate ?? 0) * 100).toFixed(0)}% success</span>
          )}
          {skill.path && (
            <span className="truncate max-w-[200px]" title={skill.path}>
              {skill.path}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-error" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SkillViewer({
  agentId,
  skillName,
  open,
  onClose,
  onEdit,
}: {
  agentId: string | null;
  skillName: string | null;
  open: boolean;
  onClose: () => void;
  onEdit: (skill: SkillDetail) => void;
}) {
  const { data: skill, isLoading } = useSkillDetail(agentId, skillName);

  const isBuiltin = skill?.source === "builtin" || skill?.source === "workspace" || skill?.source === "embedded";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {skillName}
            {skill?.source && (
              <Badge
                variant={SOURCE_LABELS[skill.source]?.variant || "outline"}
                className="text-[10px] ml-1"
              >
                {SOURCE_LABELS[skill.source]?.label || skill.source}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : skill ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {skill.description && (
              <p className="text-sm text-muted-foreground">{skill.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {skill.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Content</Label>
              <pre className="mt-1 rounded-lg bg-[#1e1e2e] p-3 text-xs text-[#cdd6f4] overflow-x-auto whitespace-pre-wrap">
                {skill.content}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              {skill.created_at && (
                <div>Created: {new Date(skill.created_at).toLocaleDateString()}</div>
              )}
              {skill.updated_at && (
                <div>Updated: {new Date(skill.updated_at).toLocaleDateString()}</div>
              )}
              {skill.version && <div>Version: {skill.version}</div>}
              {(skill.usage_count ?? 0) > 0 && (
                <div>Uses: {skill.usage_count} ({((skill.success_rate || 0) * 100).toFixed(0)}% success)</div>
              )}
              {skill.learned_from?.agent_id && (
                <div className="col-span-2">
                  Learned from: {skill.learned_from.agent_id} / {skill.learned_from.session_id || "\u2014"}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">Skill not found</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {skill && !isBuiltin && (
            <Button onClick={() => onEdit(skill)}>
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
