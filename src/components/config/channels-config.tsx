import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import type { ChannelsConfig } from "@/types/api";

interface ChannelsConfigProps {
  value: ChannelsConfig;
  onChange: (value: ChannelsConfig) => void;
}

const KNOWN_CHANNELS = [
  "feishu", "dingtalk", "wechat_personal", "telegram", "discord",
  "slack", "whatsapp", "email", "qq", "mochat", "wecom", "matrix",
];

function isSecretKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    lower.includes("secret") ||
    lower.includes("password") ||
    lower.includes("token") ||
    (lower.includes("key") && !lower.includes("keyword"))
  );
}

function isZeroValue(val: unknown): boolean {
  if (val === false || val === 0 || val === "" || val == null) return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

const CREDENTIAL_KEYS = new Set([
  "app_id", "client_id", "bot_id", "user_id", "device_id",
  "ilink_user_id",
]);

function isCredentialKey(key: string): boolean {
  return isSecretKey(key) || CREDENTIAL_KEYS.has(key);
}

function formatDisplayValue(val: unknown): string {
  if (val === true) return "true";
  if (val === false) return "false";
  if (Array.isArray(val)) return val.length === 0 ? "[]" : val.join(", ");
  if (val == null) return "";
  return String(val);
}

function StringArrayEditor({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            className="h-8 text-xs"
            value={item}
            onChange={(e) => {
              const updated = [...value];
              updated[i] = e.target.value;
              onChange(updated);
            }}
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

function ObjectFieldEditor({
  data,
  onChange,
  compact = false,
}: {
  data: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  compact?: boolean;
}) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const inputCls = compact ? "h-8 text-xs" : "";
  const labelCls = compact ? "text-xs" : "";

  return (
    <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-3"}>
      {Object.entries(data).map(([key, val]) => {
        const label = key.replace(/_/g, " ");

        if (typeof val === "boolean") {
          return (
            <div key={key} className="flex items-center gap-2">
              <Switch
                checked={val}
                onCheckedChange={(checked) =>
                  onChange({ ...data, [key]: checked })
                }
              />
              <Label className={`capitalize ${labelCls}`}>{label}</Label>
            </div>
          );
        }

        if (typeof val === "string" || typeof val === "number") {
          return (
            <div key={key}>
              <Label className={`capitalize ${labelCls}`}>{label}</Label>
              <Input
                className={inputCls}
                type={
                  typeof val === "number"
                    ? "number"
                    : isSecretKey(key)
                      ? "password"
                      : "text"
                }
                step={typeof val === "number" ? "any" : undefined}
                value={String(val)}
                onChange={(e) =>
                  onChange({
                    ...data,
                    [key]:
                      typeof val === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
                placeholder={key}
              />
            </div>
          );
        }

        if (Array.isArray(val)) {
          if (val.length === 0 || typeof val[0] === "string") {
            return (
              <div key={key} className={compact ? "col-span-2" : ""}>
                <StringArrayEditor
                  label={label}
                  value={(val as string[]) || []}
                  onChange={(arr) => onChange({ ...data, [key]: arr })}
                />
              </div>
            );
          }
          return null;
        }

        if (val !== null && typeof val === "object") {
          const isExpanded = expandedKeys.has(key);
          return (
            <div key={key} className={`border border-border rounded-lg ${compact ? "col-span-2" : ""}`}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium capitalize hover:bg-surface-1"
                onClick={() => toggle(key)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {label}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3">
                  <ObjectFieldEditor
                    data={val as Record<string, unknown>}
                    onChange={(updated) =>
                      onChange({ ...data, [key]: updated })
                    }
                    compact={compact}
                  />
                </div>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function InheritableFieldRow({
  fieldKey,
  parentValue,
  accountValue,
  isOverridden,
  onToggleOverride,
  onChange,
}: {
  fieldKey: string;
  parentValue: unknown;
  accountValue: unknown;
  isOverridden: boolean;
  onToggleOverride: (enable: boolean) => void;
  onChange: (val: unknown) => void;
}) {
  const label = fieldKey.replace(/_/g, " ");
  const displayVal = isOverridden ? accountValue : parentValue;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <Switch
        className="shrink-0"
        checked={isOverridden}
        onCheckedChange={onToggleOverride}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Label className="text-xs capitalize shrink-0">{label}</Label>
          {typeof displayVal === "boolean" ? (
            isOverridden ? (
              <Switch
                checked={displayVal as boolean}
                onCheckedChange={(checked) => onChange(checked)}
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                {displayVal ? "true" : "false"}
              </span>
            )
          ) : Array.isArray(displayVal) ? (
            <div className="flex-1">
              {isOverridden ? (
                <StringArrayEditor
                  label=""
                  value={(displayVal as string[]) || []}
                  onChange={(arr) => onChange(arr)}
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  {formatDisplayValue(displayVal)}
                </span>
              )}
            </div>
          ) : (
            <Input
              className="h-7 text-xs flex-1"
              type={typeof displayVal === "number" ? "number" : "text"}
              step={typeof displayVal === "number" ? "any" : undefined}
              value={String(displayVal ?? "")}
              disabled={!isOverridden}
              onChange={(e) =>
                onChange(
                  typeof parentValue === "number"
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
            />
          )}
        </div>
      </div>
      <div className="shrink-0 w-32 text-right">
        {isOverridden ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-[10px] text-muted-foreground truncate">
              Default: {formatDisplayValue(parentValue)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              title="Reset to inherited"
              onClick={() => onToggleOverride(false)}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Badge variant="outline" className="text-[10px] h-4">
            Inherited
          </Badge>
        )}
      </div>
    </div>
  );
}

function InheritanceAccountEditor({
  accountId,
  accountData,
  inlineDefaults,
  onChange,
  onRemove,
  defaultExpanded,
}: {
  accountId: string;
  accountData: Record<string, unknown>;
  inlineDefaults: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  onRemove: () => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  const credentialFields: Record<string, unknown> = {};
  const inheritableKeys = new Set<string>();

  for (const key of Object.keys(accountData)) {
    if (isCredentialKey(key)) {
      credentialFields[key] = accountData[key];
    }
  }

  const allKeys = new Set([
    ...Object.keys(inlineDefaults),
    ...Object.keys(accountData),
  ]);
  for (const key of allKeys) {
    if (!isCredentialKey(key)) {
      inheritableKeys.add(key);
    }
  }

  let overrideCount = 0;
  for (const key of inheritableKeys) {
    if (key in accountData && !isZeroValue(accountData[key])) {
      overrideCount++;
    }
  }

  const handleToggleOverride = (key: string, enable: boolean) => {
    if (enable) {
      const parentVal = inlineDefaults[key];
      onChange({ ...accountData, [key]: parentVal ?? "" });
    } else {
      const updated = { ...accountData };
      delete updated[key];
      onChange(updated);
    }
  };

  const handleFieldChange = (key: string, val: unknown) => {
    onChange({ ...accountData, [key]: val });
  };

  return (
    <Card className="border-dashed">
      <CardHeader
        className="cursor-pointer py-2 px-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle className="text-xs font-mono">{accountId}</CardTitle>
            {overrideCount > 0 ? (
              <Badge variant="default" className="text-[10px] h-4">
                {overrideCount} override{overrideCount !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] h-4">
                all inherited
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3.5 w-3.5 text-error" />
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="px-3 pb-3 pt-0 space-y-4">
          {Object.keys(credentialFields).length > 0 && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Credentials
              </Label>
              <ObjectFieldEditor
                data={credentialFields}
                onChange={(updated) => {
                  onChange({ ...accountData, ...updated });
                }}
                compact
              />
            </div>
          )}

          {inheritableKeys.size > 0 && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Settings
              </Label>
              <div className="space-y-0.5">
                {Array.from(inheritableKeys)
                  .sort()
                  .map((key) => {
                    const parentVal = inlineDefaults[key];
                    const accountVal = accountData[key];
                    const isOverridden =
                      key in accountData && !isZeroValue(accountVal);

                    return (
                      <InheritableFieldRow
                        key={key}
                        fieldKey={key}
                        parentValue={parentVal}
                        accountValue={accountVal}
                        isOverridden={isOverridden}
                        onToggleOverride={(enable) =>
                          handleToggleOverride(key, enable)
                        }
                        onChange={(val) => handleFieldChange(key, val)}
                      />
                    );
                  })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Note: boolean false and numeric 0 cannot override non-zero parent values (backend limitation).
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ChannelsConfigEditor({
  value,
  onChange,
}: ChannelsConfigProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [newAccountId, setNewAccountId] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={value.send_progress}
            onCheckedChange={(checked) =>
              onChange({ ...value, send_progress: checked })
            }
          />
          <Label>Send Progress</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={value.send_tool_hints}
            onCheckedChange={(checked) =>
              onChange({ ...value, send_tool_hints: checked })
            }
          />
          <Label>Send Tool Hints</Label>
        </div>
      </div>

      <div className="space-y-3">
        {KNOWN_CHANNELS.map((ch) => {
          const channelCfg = value[ch] as Record<string, unknown> | undefined;
          if (!channelCfg || typeof channelCfg !== "object") return null;

          const isExpanded = expandedChannel === ch;
          const enabled = channelCfg.enabled as boolean | undefined;
          const accounts = channelCfg.accounts as
            | Record<string, Record<string, unknown>>
            | undefined;
          const accountCount = accounts ? Object.keys(accounts).length : 0;

          const topFields: Record<string, unknown> = {};
          const inlineFields: Record<string, unknown> = {};

          for (const [key, val] of Object.entries(channelCfg)) {
            if (key === "accounts") continue;
            if (key === "enabled" || key === "default_account") {
              topFields[key] = val;
            } else {
              inlineFields[key] = val;
            }
          }

          const addAccount = () => {
            const id = newAccountId.trim() || `account-${Date.now()}`;
            const updatedAccounts = { ...(accounts || {}), [id]: {} };
            onChange({
              ...value,
              [ch]: { ...channelCfg, accounts: updatedAccounts },
            });
            setNewAccountId("");
          };

          return (
            <Card key={ch}>
              <CardHeader
                className="cursor-pointer py-3"
                onClick={() =>
                  setExpandedChannel(isExpanded ? null : ch)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <CardTitle className="text-sm capitalize">
                      {ch.replace(/_/g, " ")}
                    </CardTitle>
                    {accountCount > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {accountCount} account{accountCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  {enabled !== undefined && (
                    <Badge variant={enabled ? "success" : "outline"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Top fields: enabled, default_account */}
                  <ObjectFieldEditor
                    data={topFields}
                    onChange={(updated) => {
                      onChange({
                        ...value,
                        [ch]: { ...channelCfg, ...updated },
                      });
                    }}
                  />

                  {/* Accounts section - shown FIRST for prominence */}
                  {accounts && typeof accounts === "object" && (
                    <div className="border-t border-border pt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Accounts ({accountCount})
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-8 w-40 text-xs"
                            placeholder="Account ID"
                            value={newAccountId}
                            onChange={(e) => setNewAccountId(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addAccount();
                            }}
                          />
                          <Button variant="outline" size="sm" onClick={addAccount}>
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                          </Button>
                        </div>
                      </div>

                      {Object.entries(accounts).map(([accountId, accountCfg], idx) => (
                        <InheritanceAccountEditor
                          key={accountId}
                          accountId={accountId}
                          accountData={accountCfg}
                          inlineDefaults={inlineFields}
                          defaultExpanded={idx === 0}
                          onChange={(updated) => {
                            onChange({
                              ...value,
                              [ch]: {
                                ...channelCfg,
                                accounts: { ...accounts, [accountId]: updated },
                              },
                            });
                          }}
                          onRemove={() => {
                            const updatedAccounts = { ...accounts };
                            delete updatedAccounts[accountId];
                            onChange({
                              ...value,
                              [ch]: { ...channelCfg, accounts: updatedAccounts },
                            });
                          }}
                        />
                      ))}

                      {accountCount === 0 && (
                        <p className="text-xs text-muted-foreground py-2">
                          No accounts configured. Click "Add" to create one.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Default/inline settings */}
                  {Object.keys(inlineFields).length > 0 && (
                    <div className="border-t border-border pt-3">
                      <Label className="text-sm font-semibold mb-1 block">
                        Default Settings
                      </Label>
                      <p className="text-[11px] text-muted-foreground mb-3">
                        These values are inherited by all accounts unless overridden.
                      </p>
                      <ObjectFieldEditor
                        data={inlineFields}
                        onChange={(updated) => {
                          onChange({
                            ...value,
                            [ch]: { ...channelCfg, ...updated },
                          });
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
