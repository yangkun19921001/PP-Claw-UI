import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.getAgents(),
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ["agents", id],
    queryFn: () => apiClient.getAgent(id),
    enabled: !!id,
  });
}

export function useSwitchModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, model }: { agentId: string; model: string }) =>
      apiClient.switchModel(agentId, model),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
