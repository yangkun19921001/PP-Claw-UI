export interface SystemStatus {
  version: string;
  commit: string;
  build_time: string;
  mode: string;
  uptime_s: number;
  model: string;
  api_port: number;
  channels?: string[];
  cron_jobs?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  model: string;
  default: boolean;
  delegates_to?: string[];
  loaded: boolean;
}

export interface AgentDetail {
  id: string;
  name?: string;
  model: string;
  max_tokens: number;
  temperature: number;
  max_tool_iterations: number;
  memory_window: number;
  context_window_tokens: number;
  workspace: string;
  default?: boolean;
  delegates_to?: string[];
  tools_include?: string[];
  tools_exclude?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: CronSchedule;
  payload: CronPayload;
  state: CronJobState;
  createdAtMs: number;
  updatedAtMs: number;
  deleteAfterRun: boolean;
}

export interface CronSchedule {
  kind: string;
  atMs?: number;
  everyMs?: number;
  expr?: string;
  tz?: string;
}

export interface CronPayload {
  kind: string;
  message: string;
  deliver: boolean;
  channel: string;
  account?: string;
  to: string;
}

export interface CronJobState {
  nextRunAtMs: number;
  lastRunAtMs: number;
  lastStatus: string;
  lastError: string;
}

export interface SessionInfo {
  key: string;
  messages?: number;
  updated_at?: string;
}

export interface SessionDetail {
  key: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
  media?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatSendRequest {
  content: string;
  agent_id?: string;
  session_id?: string;
  media?: string[];
}

export interface ChatSendResponse {
  content: string;
  session_id: string;
  media?: string[];
  duration_ms: number;
}

export interface ChannelStatus {
  [key: string]: {
    enabled: boolean;
    status: string;
    accounts?: number;
  };
}

// Config types

export interface AgentToolsConfig {
  include?: string[];
  exclude?: string[];
}

export interface AgentEntry {
  id: string;
  name: string;
  default: boolean;
  model: string;
  workspace: string;
  max_tokens: number;
  temperature: number;
  max_tool_iterations: number;
  memory_window: number;
  context_window_tokens: number;
  tools?: AgentToolsConfig;
  delegates_to?: string[];
}

export interface ContentMatch {
  keywords?: string[];
  regex?: string;
  llm_route?: boolean;
  llm_prompt?: string;
  candidates?: string[];
}

export interface AgentBinding {
  agent_id: string;
  channel: string;
  account_id?: string;
  chat_ids?: string[];
  sender_ids?: string[];
  default: boolean;
  content_match?: ContentMatch;
}

export interface AgentsConfig {
  defaults: {
    workspace: string;
    model: string;
    max_tokens: number;
    temperature: number;
    max_tool_iterations: number;
    memory_window: number;
    context_window_tokens: number;
  };
  list: AgentEntry[];
  bindings: AgentBinding[];
}

export interface ProviderConfig {
  api_key?: string;
  base_url?: string;
  api_base?: string;
  model?: string;
  default_model?: string;
  api_version?: string;
  extra_headers?: Record<string, string>;
}

export interface ProvidersConfig {
  [key: string]: ProviderConfig;
}

export interface ChannelsConfig {
  send_progress: boolean;
  send_tool_hints: boolean;
  [key: string]: unknown;
}

export interface GatewayConfig {
  host: string;
  port: number;
  heartbeat?: {
    enabled: boolean;
    interval_s: number;
  };
}

export interface MCPServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  tool_timeout?: string;
}

export interface ToolsConfig {
  web?: {
    search?: {
      api_key?: string;
      max_results?: number;
    };
  };
  exec?: {
    timeout?: string;
  };
  restrict_to_workspace?: boolean;
  mcp_servers?: Record<string, MCPServerConfig>;
}

export interface LearningConfig {
  enabled: boolean;
  skill_extraction?: {
    review_interval?: string;
    min_conversation_length?: number;
    min_tool_calls?: number;
    extractor_model?: string;
    review_prompt?: string;
  };
  storage?: {
    type?: string;
    path?: string;
    max_skills?: number;
  };
  injection?: {
    max_inject_skills?: number;
    similarity_threshold?: number;
    cache_expire_seconds?: number;
    enable_semantic_match?: boolean;
  };
}

export interface RLConfig {
  enabled: boolean;
  tracking?: {
    storage_path?: string;
    max_trajectories?: number;
    retention_days?: number;
    auto_cleanup?: boolean;
    flush_interval?: string;
  };
  compression?: {
    target_max_steps?: number;
    summary_target_length?: number;
    compression_strategy?: string;
    model_name?: string;
    min_compression_ratio?: number;
    protected_steps?: {
      first_n?: number;
      last_n?: number;
      protect_error?: boolean;
      protect_tool?: boolean;
    };
  };
  reward?: {
    success_reward?: number;
    time_reward?: {
      max_duration?: string;
      penalty_per_step?: number;
    };
    token_reward?: {
      max_tokens?: number;
      penalty_per_token?: number;
    };
    tool_reward?: {
      success_bonus?: number;
      failure_penalty?: number;
    };
    error_reward?: {
      recovery_bonus?: number;
      repeated_penalty?: number;
    };
  };
  optimization?: {
    update_interval?: string;
    min_trajectories?: number;
    learning_rate?: number;
    exploration_rate?: number;
  };
}

export interface PPClawConfig {
  agents: AgentsConfig;
  channels: ChannelsConfig;
  providers: ProvidersConfig;
  gateway: GatewayConfig;
  tools: ToolsConfig;
  learning?: LearningConfig;
  rl?: RLConfig;
}

// WebSocket event types
export interface WSEvent {
  type: "message" | "progress" | "tool_hint" | "tool_start" | "tool_done" | "pong";
  channel?: string;
  chat_id?: string;
  content?: string;
  media?: string[];
  metadata?: Record<string, unknown>;
  timestamp: number;
  session_key?: string;
}

export interface WSOutgoing {
  type: "message" | "ping";
  content?: string;
  session_id?: string;
  agent_id?: string;
  media?: string[];
}
