import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { SkillDetail, AgentSkillsResponse } from "@/lib/api-client";

export function useAllSkills() {
  return useQuery<AgentSkillsResponse[]>({
    queryKey: ["skills", "all"],
    queryFn: () => apiClient.getSkillsByAgent(),
    refetchInterval: 30000,
  });
}

export function useAgentSkills(agentId: string | null) {
  return useQuery({
    queryKey: ["skills", agentId],
    queryFn: () => apiClient.getAgentSkills(agentId!),
    enabled: !!agentId,
  });
}

export function useSkillDetail(agentId: string | null, name: string | null) {
  return useQuery({
    queryKey: ["skills", agentId, name],
    queryFn: () => apiClient.getSkill(agentId!, name!),
    enabled: !!agentId && !!name,
  });
}

export function useSaveSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, skill }: { agentId: string; skill: Partial<SkillDetail> }) =>
      apiClient.saveSkill(agentId, skill),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}

export function useDeleteSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, name }: { agentId: string; name: string }) =>
      apiClient.deleteSkill(agentId, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}
