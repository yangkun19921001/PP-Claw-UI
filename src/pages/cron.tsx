import { useState, useMemo } from "react";
import { useCronJobs, useCreateCronJob, useDeleteCronJob, useToggleCronJob } from "@/hooks/use-cron";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Clock,
  Plus,
  Trash2,
  Play,
  Pause,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import type { CronJob } from "@/types/api";

function formatMs(ms: number): string {
  if (!ms || ms <= 0) return "—";
  return new Date(ms).toLocaleString();
}

function describeSchedule(job: CronJob): string {
  const s = job.schedule;
  if (s.kind === "cron" && s.expr) return s.expr + (s.tz ? ` (${s.tz})` : "");
  if (s.kind === "every" && s.everyMs) {
    const sec = Math.round(s.everyMs / 1000);
    if (sec < 60) return `Every ${sec}s`;
    if (sec < 3600) return `Every ${Math.round(sec / 60)}m`;
    return `Every ${(sec / 3600).toFixed(1)}h`;
  }
  if (s.kind === "at" && s.atMs) return `Once at ${formatMs(s.atMs)}`;
  return s.kind || "unknown";
}

function describeTarget(job: CronJob): string {
  const p = job.payload;
  const parts: string[] = [];
  if (p.channel) parts.push(p.channel);
  if (p.to) parts.push(p.to.length > 20 ? p.to.slice(0, 20) + "..." : p.to);
  if (parts.length === 0) return "local";
  return parts.join(" / ");
}

function JobCard({
  job,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onDelete,
  onRunNow,
}: {
  job: CronJob;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onRunNow: () => void;
}) {
  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center gap-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm">{job.name}</CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            {describeSchedule(job)} → {describeTarget(job)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={job.enabled ? "success" : "outline"}>
            {job.enabled ? "Active" : "Disabled"}
          </Badge>
          {job.state?.lastStatus && (
            <Badge
              variant={
                job.state.lastStatus === "ok"
                  ? "success"
                  : job.state.lastStatus === "error"
                    ? "destructive"
                    : "outline"
              }
            >
              {job.state.lastStatus}
            </Badge>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="rounded-lg bg-surface-1 p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Message</span>
              <span className="text-right max-w-[60%] truncate" title={job.payload.message}>
                {job.payload.message}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule</span>
              <span>{describeSchedule(job)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Channel</span>
              <span>{job.payload.channel || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <span className="truncate max-w-[60%]" title={job.payload.to}>
                {job.payload.to || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deliver</span>
              <span>{job.payload.deliver ? "Yes" : "No"}</span>
            </div>
            {job.payload.account && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span>{job.payload.account}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Run</span>
              <span>{formatMs(job.state?.nextRunAtMs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Run</span>
              <span>{formatMs(job.state?.lastRunAtMs)}</span>
            </div>
            {job.state?.lastError && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Error</span>
                <span className="text-error truncate max-w-[60%]" title={job.state.lastError}>
                  {job.state.lastError}
                </span>
              </div>
            )}
            {job.deleteAfterRun && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">One-shot</span>
                <span>Delete after run</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatMs(job.createdAtMs)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onRunNow}>
              <PlayCircle className="h-3.5 w-3.5 mr-1" /> Run Now
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleEnabled}>
              {job.enabled ? (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1" /> Disable
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 mr-1" /> Enable
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-error hover:text-error"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function CronPage() {
  const { data: jobs, isLoading, isError, error } = useCronJobs();
  const createJob = useCreateCronJob();
  const deleteJob = useDeleteCronJob();
  const toggleJob = useToggleCronJob();
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    message: "",
    scheduleKind: "cron" as "cron" | "every" | "at",
    expr: "",
    tz: "",
    everyMinutes: 60,
    deliver: false,
    channel: "",
    account: "",
    to: "",
    deleteAfterRun: false,
  });

  const channelGroups = useMemo(() => {
    if (!jobs) return { channels: [] as string[], grouped: {} as Record<string, CronJob[]> };
    const grouped: Record<string, CronJob[]> = {};
    for (const job of jobs) {
      const ch = job.payload?.channel || "local";
      if (!grouped[ch]) grouped[ch] = [];
      grouped[ch].push(job);
    }
    const channels = Object.keys(grouped).sort();
    return { channels, grouped };
  }, [jobs]);

  const resetForm = () =>
    setForm({
      name: "",
      message: "",
      scheduleKind: "cron",
      expr: "",
      tz: "",
      everyMinutes: 60,
      deliver: false,
      channel: "",
      account: "",
      to: "",
      deleteAfterRun: false,
    });

  const handleCreate = async () => {
    if (!form.name || !form.message) return;
    try {
      await createJob.mutateAsync({
        name: form.name,
        message: form.message,
        schedule:
          form.scheduleKind === "cron"
            ? { kind: "cron", expr: form.expr, tz: form.tz || undefined }
            : form.scheduleKind === "every"
              ? { kind: "every", everyMs: form.everyMinutes * 60 * 1000 }
              : { kind: "at", atMs: Date.now() + form.everyMinutes * 60 * 1000 },
        deliver: form.deliver,
        channel: form.channel || undefined,
        account: form.account || undefined,
        to: form.to || undefined,
        delete_after_run: form.deleteAfterRun,
      });
      toast.success("Cron job created");
      setShowCreate(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteJob.mutateAsync(id);
      toast.success("Job deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleJob.mutateAsync({ id, enabled });
      toast.success(enabled ? "Job enabled" : "Job disabled");
    } catch {
      toast.error("Toggle failed");
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      await apiClient.runCronJob(id);
      toast.success("Job triggered");
    } catch {
      toast.error("Run failed");
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
            Failed to load cron jobs:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const renderJobList = (jobList: CronJob[]) => {
    if (jobList.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No cron jobs in this group</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {jobList.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            expanded={expanded === job.id}
            onToggleExpand={() => setExpanded(expanded === job.id ? null : job.id)}
            onToggleEnabled={() => handleToggle(job.id, !job.enabled)}
            onDelete={() => handleDelete(job.id)}
            onRunNow={() => handleRunNow(job.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cron Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs?.length || 0} scheduled tasks
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Job
        </Button>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No cron jobs configured</p>
          </CardContent>
        </Card>
      ) : channelGroups.channels.length <= 1 ? (
        renderJobList(jobs)
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({jobs.length})
            </TabsTrigger>
            {channelGroups.channels.map((ch) => (
              <TabsTrigger key={ch} value={ch} className="capitalize">
                {ch.replace(/_/g, " ")} ({channelGroups.grouped[ch].length})
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {renderJobList(jobs)}
          </TabsContent>
          {channelGroups.channels.map((ch) => (
            <TabsContent key={ch} value={ch} className="mt-4">
              {renderJobList(channelGroups.grouped[ch])}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Cron Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="daily-report"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="The task to execute..."
                rows={3}
              />
            </div>

            <div>
              <Label>Schedule Type</Label>
              <div className="flex gap-2 mt-1">
                {(["cron", "every", "at"] as const).map((k) => (
                  <Button
                    key={k}
                    variant={form.scheduleKind === k ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, scheduleKind: k })}
                  >
                    {k === "cron" ? "Cron Expr" : k === "every" ? "Interval" : "One-shot"}
                  </Button>
                ))}
              </div>
            </div>

            {form.scheduleKind === "cron" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cron Expression</Label>
                  <Input
                    value={form.expr}
                    onChange={(e) => setForm({ ...form, expr: e.target.value })}
                    placeholder="0 9 * * *"
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input
                    value={form.tz}
                    onChange={(e) => setForm({ ...form, tz: e.target.value })}
                    placeholder="Asia/Shanghai"
                  />
                </div>
              </div>
            )}

            {form.scheduleKind === "every" && (
              <div>
                <Label>Interval (minutes)</Label>
                <Input
                  type="number"
                  value={form.everyMinutes}
                  onChange={(e) => setForm({ ...form, everyMinutes: Number(e.target.value) })}
                  min={1}
                />
              </div>
            )}

            {form.scheduleKind === "at" && (
              <div>
                <Label>Run after (minutes from now)</Label>
                <Input
                  type="number"
                  value={form.everyMinutes}
                  onChange={(e) => setForm({ ...form, everyMinutes: Number(e.target.value) })}
                  min={1}
                />
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-3">
              <h4 className="text-sm font-medium">Delivery</h4>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.deliver}
                  onCheckedChange={(checked) => setForm({ ...form, deliver: checked })}
                />
                <Label className="text-sm">Deliver to channel</Label>
              </div>
              {form.deliver && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Channel</Label>
                    <Input
                      value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      placeholder="feishu"
                    />
                  </div>
                  <div>
                    <Label>To (user/chat ID)</Label>
                    <Input
                      value={form.to}
                      onChange={(e) => setForm({ ...form, to: e.target.value })}
                      placeholder="user_id or chat_id"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Account (optional)</Label>
                    <Input
                      value={form.account}
                      onChange={(e) => setForm({ ...form, account: e.target.value })}
                      placeholder="Account ID"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.deleteAfterRun}
                onCheckedChange={(checked) => setForm({ ...form, deleteAfterRun: checked })}
              />
              <Label className="text-sm">Delete after run (one-shot)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createJob.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
