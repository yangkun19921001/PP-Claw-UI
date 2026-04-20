import { useState } from "react";
import { useTools } from "@/hooks/use-tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wrench, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ToolsPage() {
  const { data: tools, isLoading } = useTools();
  const [search, setSearch] = useState("");
  const { t } = useI18n();

  const filtered = tools?.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("tools.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("tools.subtitle", { count: tools?.length || 0 })}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("tools.search")}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((tool) => (
            <Card key={tool.name}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {tool.description || t("tools.noDescription")}
                </p>
                {tool.parameters && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.keys(
                      (tool.parameters as Record<string, unknown>)?.properties || {},
                    ).map((param) => (
                      <Badge key={param} variant="outline" className="text-[10px]">
                        {param}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
