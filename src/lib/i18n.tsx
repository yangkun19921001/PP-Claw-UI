import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "zh" | "en";

const STORAGE_KEY = "pp-claw-ui-language";

type TranslationParams = Record<string, string | number | undefined>;
type TranslationValue = string | ((params: TranslationParams) => string);

const en = {
  "brand.name": "PP-Claw",

  "nav.dashboard": "Dashboard",
  "nav.chat": "Chat",
  "nav.config": "Config",
  "nav.agents": "Agents",
  "nav.tools": "Tools",
  "nav.channels": "Channels",
  "nav.cron": "Cron Jobs",
  "nav.skills": "Skills",
  "nav.settings": "Settings",

  "common.connecting": "Connecting...",
  "common.disconnected": "Disconnected",
  "common.connected": "Connected",
  "common.clear": "Clear",
  "common.loading": "Loading...",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.default": "Default",
  "common.loaded": "Loaded",
  "common.active": "Active",
  "common.idle": "Idle",
  "common.enabled": "Enabled",
  "common.disabled": "Disabled",
  "common.online": "Online",
  "common.language": "Language",
  "common.chinese": "中文",
  "common.english": "English",
  "common.agentMode": "Agent Mode",
  "common.gatewayMode": "Gateway Mode",

  "connection.status": ({ mode, version }) => `${mode} - v${version}`,

  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "PP-Claw system overview",
  "dashboard.loading": "Connecting to PP-Claw...",
  "dashboard.failed": "Connection Failed",
  "dashboard.ensureRunning": "Make sure PP-Claw is running on port 18790",
  "dashboard.status": "Status",
  "dashboard.model": "Model",
  "dashboard.agents": "Agents",
  "dashboard.tools": "Tools",
  "dashboard.registered": "registered",
  "dashboard.loaded": ({ count }) => `${count} loaded`,
  "dashboard.uptime": ({ minutes }) => `Uptime: ${minutes}m`,
  "dashboard.noAgents": "No agents configured",
  "dashboard.cronJobs": "Cron Jobs",
  "dashboard.noCron": "No cron jobs",

  "chat.sessions": "Sessions",
  "chat.new": "New Chat",
  "chat.msgCount": ({ count }) => `${count} msgs`,
  "chat.empty": "Send a message to start chatting",
  "chat.reconnecting": "Reconnecting... messages will be sent automatically",
  "chat.remove": "Remove",
  "chat.attachFile": "Attach file",
  "chat.sendImage": "Send image",
  "chat.processingPlaceholder": "Processing, you can type ahead...",
  "chat.typePlaceholder": "Type a message...",
  "chat.waitingResponse": "Waiting for response...",
  "chat.send": "Send",
  "chat.disconnectedFromServer": "Disconnected from server",
  "chat.uploaded": ({ count }) => `Uploaded ${count} file(s)`,
  "chat.uploadFailed": ({ error }) => `Upload failed: ${error}`,

  "config.title": "Configuration",
  "config.subtitle": "Manage all PP-Claw settings",
  "config.failed": "Failed to load configuration",
  "config.saved": "Configuration saved",
  "config.saveChanges": "Save Changes",
  "config.tab.agents": "Agents",
  "config.tab.providers": "Providers",
  "config.tab.channels": "Channels",
  "config.tab.gateway": "Gateway",
  "config.tab.tools": "Tools",
  "config.tab.learning": "Learning",
  "config.tab.rl": "RL",

  "agents.title": "Agents",
  "agents.subtitle": "View and manage agents",
  "agents.switchModel": "Switch Model",
  "agents.detail": ({ id }) => `Agent Detail: ${id}`,
  "agents.newModel": "New Model",
  "agents.modelSwitched": ({ model }) => `Model switched to ${model}`,
  "agents.failed": ({ error }) => `Failed: ${error}`,
  "agents.switchDialog": ({ id }) => `Switch Model - ${id}`,

  "tools.title": "Tools",
  "tools.subtitle": ({ count }) => `${count} tools registered`,
  "tools.search": "Search tools...",
  "tools.noDescription": "No description",

  "channels.title": "Channels",
  "channels.subtitle": "Channel status overview",
  "channels.none": "No channels configured. Add channels in the Configuration page.",
  "channels.failed": ({ error }) => `Failed to load channels: ${error}`,
  "channels.accountCount": ({ count }) => `${count} account${Number(count) === 1 ? "" : "s"}`,
  "channels.lastSeen": ({ time }) => `Last seen: ${time}`,
  "channels.pausedUntil": ({ time }) => `Paused until: ${time}`,
  "channels.running": "Running",
  "channels.stopped": "Stopped",
  "channels.loggedIn": "Logged in",
  "channels.notLoggedIn": "Not logged in",

  "cron.title": "Cron Jobs",
  "cron.subtitle": ({ count }) => `${count} scheduled tasks`,
  "cron.new": "New Job",
  "cron.none": "No cron jobs configured",
  "cron.noneGroup": "No cron jobs in this group",
  "cron.create": "Create Cron Job",
  "cron.all": ({ count }) => `All (${count})`,
  "cron.failed": ({ error }) => `Failed to load cron jobs: ${error}`,

  "skills.title": "Skills",
  "skills.subtitle": ({ skills, agents }) => `${skills} skills across ${agents} agents`,
  "skills.new": "New Skill",
  "skills.none":
    "No skills found. Built-in skills appear when SKILL.md files are in the workspace or skills directory. Learned skills are automatically extracted from conversations when learning is enabled.",
  "skills.builtin": ({ count }) => `${count} built-in`,
  "skills.learned": ({ count }) => `${count} learned`,
  "skills.failed": ({ error }) => `Failed to load skills: ${error}`,

  "settings.title": "Settings",
  "settings.subtitle": "Application settings",
  "settings.languageTitle": "Language",
  "settings.languageLabel": "Interface Language",
  "settings.apiTitle": "API Connection",
  "settings.apiBaseUrl": "PP-Claw API Base URL",
  "settings.connect": "Connect",
  "settings.connectSuccess": ({ base }) => `API base set to ${base}`,
  "settings.defaultHint": ({ defaultBase }) =>
    `Default: ${defaultBase} (agent mode) or http://127.0.0.1:18790 (gateway mode)`,
  "settings.connectedBackend": "Connected to PP-Claw backend",
  "settings.about": "About",
  "settings.uiVersion": "PP-Claw UI Version",
  "settings.backend": "PP-Claw Backend",
  "settings.commit": "Commit",
  "settings.buildTime": "Build Time",
} satisfies Record<string, TranslationValue>;

const zh: Record<keyof typeof en, TranslationValue> = {
  "brand.name": "皮皮虾",

  "nav.dashboard": "总览",
  "nav.chat": "聊天",
  "nav.config": "配置",
  "nav.agents": "智能体",
  "nav.tools": "工具",
  "nav.channels": "渠道",
  "nav.cron": "定时任务",
  "nav.skills": "技能",
  "nav.settings": "设置",

  "common.connecting": "连接中...",
  "common.disconnected": "未连接",
  "common.connected": "已连接",
  "common.clear": "清空",
  "common.loading": "加载中...",
  "common.cancel": "取消",
  "common.save": "保存",
  "common.default": "默认",
  "common.loaded": "已加载",
  "common.active": "启用中",
  "common.idle": "空闲",
  "common.enabled": "已启用",
  "common.disabled": "已禁用",
  "common.online": "在线",
  "common.language": "语言",
  "common.chinese": "中文",
  "common.english": "English",
  "common.agentMode": "Agent 模式",
  "common.gatewayMode": "网关模式",

  "connection.status": ({ mode, version }) => `${mode} · v${version}`,

  "dashboard.title": "总览",
  "dashboard.subtitle": "皮皮虾系统概览",
  "dashboard.loading": "正在连接皮皮虾...",
  "dashboard.failed": "连接失败",
  "dashboard.ensureRunning": "请确认皮皮虾服务运行在 18790 端口",
  "dashboard.status": "状态",
  "dashboard.model": "模型",
  "dashboard.agents": "智能体",
  "dashboard.tools": "工具",
  "dashboard.registered": "已注册",
  "dashboard.loaded": ({ count }) => `${count} 个已加载`,
  "dashboard.uptime": ({ minutes }) => `运行时长：${minutes} 分钟`,
  "dashboard.noAgents": "暂无已配置的智能体",
  "dashboard.cronJobs": "定时任务",
  "dashboard.noCron": "暂无定时任务",

  "chat.sessions": "会话",
  "chat.new": "新建聊天",
  "chat.msgCount": ({ count }) => `${count} 条消息`,
  "chat.empty": "发送一条消息开始聊天",
  "chat.reconnecting": "正在重连... 消息会在连上后自动发送",
  "chat.remove": "移除",
  "chat.attachFile": "添加文件",
  "chat.sendImage": "发送图片",
  "chat.processingPlaceholder": "正在处理，你可以继续输入...",
  "chat.typePlaceholder": "输入消息...",
  "chat.waitingResponse": "等待响应中...",
  "chat.send": "发送",
  "chat.disconnectedFromServer": "与服务端连接已断开",
  "chat.uploaded": ({ count }) => `已上传 ${count} 个文件`,
  "chat.uploadFailed": ({ error }) => `上传失败：${error}`,

  "config.title": "配置",
  "config.subtitle": "管理全部皮皮虾配置",
  "config.failed": "加载配置失败",
  "config.saved": "配置已保存",
  "config.saveChanges": "保存修改",
  "config.tab.agents": "智能体",
  "config.tab.providers": "模型提供方",
  "config.tab.channels": "渠道",
  "config.tab.gateway": "网关",
  "config.tab.tools": "工具",
  "config.tab.learning": "学习",
  "config.tab.rl": "强化学习",

  "agents.title": "智能体",
  "agents.subtitle": "查看并管理智能体",
  "agents.switchModel": "切换模型",
  "agents.detail": ({ id }) => `智能体详情：${id}`,
  "agents.newModel": "新模型",
  "agents.modelSwitched": ({ model }) => `模型已切换为 ${model}`,
  "agents.failed": ({ error }) => `操作失败：${error}`,
  "agents.switchDialog": ({ id }) => `切换模型 - ${id}`,

  "tools.title": "工具",
  "tools.subtitle": ({ count }) => `共注册 ${count} 个工具`,
  "tools.search": "搜索工具...",
  "tools.noDescription": "暂无描述",

  "channels.title": "渠道",
  "channels.subtitle": "渠道状态概览",
  "channels.none": "当前没有配置渠道，请先在配置页面添加。",
  "channels.failed": ({ error }) => `加载渠道失败：${error}`,
  "channels.accountCount": ({ count }) => `${count} 个账号`,
  "channels.lastSeen": ({ time }) => `最后在线：${time}`,
  "channels.pausedUntil": ({ time }) => `暂停至：${time}`,
  "channels.running": "运行中",
  "channels.stopped": "已停止",
  "channels.loggedIn": "已登录",
  "channels.notLoggedIn": "未登录",

  "cron.title": "定时任务",
  "cron.subtitle": ({ count }) => `共 ${count} 个计划任务`,
  "cron.new": "新建任务",
  "cron.none": "暂无定时任务",
  "cron.noneGroup": "该分组下暂无定时任务",
  "cron.create": "创建定时任务",
  "cron.all": ({ count }) => `全部（${count}）`,
  "cron.failed": ({ error }) => `加载定时任务失败：${error}`,

  "skills.title": "技能",
  "skills.subtitle": ({ skills, agents }) => `${agents} 个智能体，共 ${skills} 个技能`,
  "skills.new": "新建技能",
  "skills.none":
    "暂未发现技能。工作区或技能目录中的 SKILL.md 会显示为内置技能；开启学习后，从对话中提取的技能会自动出现在这里。",
  "skills.builtin": ({ count }) => `${count} 个内置`,
  "skills.learned": ({ count }) => `${count} 个学习所得`,
  "skills.failed": ({ error }) => `加载技能失败：${error}`,

  "settings.title": "设置",
  "settings.subtitle": "应用设置",
  "settings.languageTitle": "语言",
  "settings.languageLabel": "界面语言",
  "settings.apiTitle": "API 连接",
  "settings.apiBaseUrl": "皮皮虾 API 地址",
  "settings.connect": "连接",
  "settings.connectSuccess": ({ base }) => `API 地址已设置为 ${base}`,
  "settings.defaultHint": ({ defaultBase }) =>
    `默认：${defaultBase}（agent 模式）或 http://127.0.0.1:18790（gateway 模式）`,
  "settings.connectedBackend": "已连接到皮皮虾后端",
  "settings.about": "关于",
  "settings.uiVersion": "皮皮虾 UI 版本",
  "settings.backend": "皮皮虾后端",
  "settings.commit": "提交",
  "settings.buildTime": "构建时间",
} satisfies Record<keyof typeof en, TranslationValue>;

const dictionaries = { en, zh };

type TranslationKey = keyof typeof en;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "zh" || stored === "en") return stored;
  } catch {}

  return window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function languageToLocale(language: Language): string {
  return language === "zh" ? "zh-CN" : "en-US";
}

export function translateMode(language: Language, mode?: string): string {
  if (mode === "gateway") return dictionaries[language]["common.gatewayMode"] as string;
  if (mode === "agent") return dictionaries[language]["common.agentMode"] as string;
  return mode || "-";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {}
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: TranslationKey, params: TranslationParams = {}) => {
      const dictValue = dictionaries[language][key];
      if (typeof dictValue === "function") {
        return dictValue(params);
      }
      return dictValue;
    };

    return {
      language,
      setLanguage,
      t,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return value;
}
