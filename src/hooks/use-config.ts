import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PPClawConfig } from "@/types/api";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => apiClient.getConfig(),
  });
}

export function useConfigSection(section: string) {
  return useQuery({
    queryKey: ["config", section],
    queryFn: () => apiClient.getConfigSection(section),
    enabled: !!section,
  });
}

export function useUpdateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<PPClawConfig>) => apiClient.updateConfig(config),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config"] });
    },
  });
}

export function useUpdateConfigSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ section, data }: { section: string; data: unknown }) =>
      apiClient.updateConfigSection(section, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
