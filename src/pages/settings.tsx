import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemVersion } from "@/hooks/use-system";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Globe, Info, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "pp-claw-api-base";
const DEFAULT_BASE = "http://127.0.0.1:18791";

function getStoredBase(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE;
  } catch {
    return DEFAULT_BASE;
  }
}

export default function SettingsPage() {
  const [apiBase, setApiBase] = useState(getStoredBase);
  const { data: version } = useSystemVersion();

  useEffect(() => {
    const stored = getStoredBase();
    if (stored !== DEFAULT_BASE) {
      apiClient.setBase(stored);
    }
  }, []);

  const handleConnect = () => {
    apiClient.setBase(apiBase);
    try {
      localStorage.setItem(STORAGE_KEY, apiBase);
    } catch {}
    toast.success(`API base set to ${apiBase}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            API Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>PP-Claw API Base URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder={DEFAULT_BASE}
              />
              <Button onClick={handleConnect}>Connect</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Default: {DEFAULT_BASE} (agent mode) or http://127.0.0.1:18790 (gateway mode)
            </p>
          </div>
          {version && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Connected to PP-Claw backend
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PP-Claw UI Version</span>
              <span>0.1.0</span>
            </div>
            {version && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PP-Claw Backend</span>
                  <span>v{version.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commit</span>
                  <span className="font-mono text-xs">{version.commit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build Time</span>
                  <span>{version.build_time}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
