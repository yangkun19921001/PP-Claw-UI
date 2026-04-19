const API_BASE = "http://127.0.0.1:18791";

export interface SkillMeta {
  name: string;
  description: string;
  version: string;
  tags: string[];
  created_at: string;
  usage_count: number;
  success_rate: number;
}

export interface SkillDetail extends SkillMeta {
  content: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  learned_from?: {
    session_id: string;
    agent_id: string;
    timestamp: string;
  };
  source?: string;
}

export interface SkillItem {
  name: string;
  description: string;
  source: "workspace" | "builtin" | "embedded" | "learned";
  version?: string;
  tags?: string[];
  available: boolean;
  path?: string;
  usage_count?: number;
  success_rate?: number;
  created_at?: string;
}

export interface AgentSkillsResponse {
  agent_id: string;
  builtin: SkillItem[];
  learned: SkillItem[];
  all_count: number;
}

interface OpenAIToolDef {
  type: string;
  function?: { name: string; description: string; parameters: Record<string, unknown> };
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

function normalizeTool(raw: OpenAIToolDef): import("@/types/api").ToolDefinition {
  if (raw.function) {
    return {
      name: raw.function.name,
      description: raw.function.description,
      parameters: raw.function.parameters,
    };
  }
  return { name: raw.name || "", description: raw.description || "", parameters: raw.parameters || {} };
}

class APIClient {
  private base: string;

  constructor(base = API_BASE) {
    this.base = base;
  }

  setBase(base: string) {
    this.base = base;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // System
  getStatus() {
    return this.request<import("@/types/api").SystemStatus>("/api/v1/system/status");
  }
  getVersion() {
    return this.request<{ version: string; commit: string; build_time: string }>("/api/v1/system/version");
  }

  // Config — backend now sends snake_case keys via yaml-tag-based serialization
  getConfig() {
    return this.request<import("@/types/api").PPClawConfig>("/api/v1/config");
  }
  updateConfig(config: Partial<import("@/types/api").PPClawConfig>) {
    return this.request<{ status: string }>("/api/v1/config", {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }
  getConfigSection(section: string) {
    return this.request<unknown>(`/api/v1/config/${section}`);
  }
  updateConfigSection(section: string, data: unknown) {
    return this.request<{ status: string }>(`/api/v1/config/${section}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Agents
  getAgents() {
    return this.request<import("@/types/api").AgentInfo[]>("/api/v1/agents");
  }
  getAgent(id: string) {
    return this.request<import("@/types/api").AgentDetail>(`/api/v1/agents/${id}`);
  }
  switchModel(agentId: string, model: string) {
    return this.request<{ status: string }>(`/api/v1/agents/${agentId}/model`, {
      method: "POST",
      body: JSON.stringify({ model }),
    });
  }

  // Chat
  sendMessage(req: import("@/types/api").ChatSendRequest) {
    return this.request<import("@/types/api").ChatSendResponse>("/api/v1/chat/send", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  // Sessions
  getSessions() {
    return this.request<import("@/types/api").SessionInfo[]>("/api/v1/sessions");
  }
  getSession(key: string) {
    return this.request<import("@/types/api").SessionDetail>(`/api/v1/sessions/${encodeURIComponent(key)}`);
  }
  clearSession(key: string) {
    return this.request<{ status: string }>(`/api/v1/sessions/${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  }

  // Channels
  getChannelsStatus() {
    return this.request<Record<string, unknown>>("/api/v1/channels/status");
  }

  // Cron — agent mode returns {jobs:[], message:""}, gateway returns array directly
  async getCronJobs(): Promise<import("@/types/api").CronJob[]> {
    const raw = await this.request<unknown>("/api/v1/cron/jobs");
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "jobs" in raw) {
      return (raw as { jobs: import("@/types/api").CronJob[] }).jobs || [];
    }
    return [];
  }
  createCronJob(job: {
    name: string;
    message: string;
    schedule: import("@/types/api").CronSchedule;
    deliver?: boolean;
    channel?: string;
    account?: string;
    to?: string;
    delete_after_run?: boolean;
  }) {
    return this.request<import("@/types/api").CronJob>("/api/v1/cron/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
  }
  deleteCronJob(id: string) {
    return this.request<{ status: string }>(`/api/v1/cron/jobs/${id}`, {
      method: "DELETE",
    });
  }
  enableCronJob(id: string, enabled: boolean) {
    return this.request<import("@/types/api").CronJob>(`/api/v1/cron/jobs/${id}/enable`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });
  }
  runCronJob(id: string) {
    return this.request<{ status: string }>(`/api/v1/cron/jobs/${id}/run`, {
      method: "POST",
    });
  }

  // Tools — backend returns OpenAI function-call format, normalize to flat
  async getTools(): Promise<import("@/types/api").ToolDefinition[]> {
    const raw = await this.request<OpenAIToolDef[]>("/api/v1/tools");
    return (raw || []).map(normalizeTool);
  }
  async getTool(name: string): Promise<import("@/types/api").ToolDefinition> {
    const raw = await this.request<OpenAIToolDef>(`/api/v1/tools/${name}`);
    return normalizeTool(raw);
  }

  // Skills
  async getSkillsByAgent(): Promise<AgentSkillsResponse[]> {
    const raw = await this.request<unknown>("/api/v1/skills");
    if (Array.isArray(raw)) return raw;
    return [];
  }
  getAgentSkills(agentId: string) {
    return this.request<SkillItem[]>(`/api/v1/skills?agent_id=${encodeURIComponent(agentId)}`);
  }
  getSkill(agentId: string, name: string) {
    return this.request<SkillDetail>(`/api/v1/skills/${encodeURIComponent(agentId)}/${encodeURIComponent(name)}`);
  }
  saveSkill(agentId: string, skill: Partial<SkillDetail>) {
    if (skill.name) {
      return this.request<SkillDetail>(`/api/v1/skills/${encodeURIComponent(agentId)}/${encodeURIComponent(skill.name)}`, {
        method: "PUT",
        body: JSON.stringify(skill),
      });
    }
    return this.request<SkillDetail>(`/api/v1/skills?agent_id=${encodeURIComponent(agentId)}`, {
      method: "POST",
      body: JSON.stringify(skill),
    });
  }
  deleteSkill(agentId: string, name: string) {
    return this.request<{ status: string }>(`/api/v1/skills/${encodeURIComponent(agentId)}/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
  }

  // Files
  async uploadFiles(files: File[]): Promise<{ files: string[]; count: number }> {
    const form = new FormData();
    for (const f of files) {
      form.append("files", f);
    }
    const res = await fetch(`${this.base}/api/v1/files/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  }

  getFileURL(path: string) {
    const name = path.includes("/") ? path.split("/").pop()! : path;
    return `${this.base}/api/v1/files/${encodeURIComponent(name)}`;
  }
}

export const apiClient = new APIClient();
export default apiClient;
