import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemVersion } from "@/hooks/use-system";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { Globe, Info, CheckCircle2, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { language, setLanguage, t } = useI18n();

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
    toast.success(t("settings.connectSuccess", { base: apiBase }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-4 w-4" />
            {t("settings.languageTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("settings.languageLabel")}</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant={language === "zh" ? "default" : "outline"}
                onClick={() => setLanguage("zh")}
              >
                {t("common.chinese")}
              </Button>
              <Button
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
              >
                {t("common.english")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            {t("settings.apiTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t("settings.apiBaseUrl")}</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder={DEFAULT_BASE}
              />
              <Button onClick={handleConnect}>{t("settings.connect")}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("settings.defaultHint", { defaultBase: DEFAULT_BASE })}
            </p>
          </div>
          {version && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              {t("settings.connectedBackend")}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            {t("settings.about")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("settings.uiVersion")}</span>
              <span>0.1.0</span>
            </div>
            {version && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("settings.backend")}</span>
                  <span>v{version.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("settings.commit")}</span>
                  <span className="font-mono text-xs">{version.commit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("settings.buildTime")}</span>
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
