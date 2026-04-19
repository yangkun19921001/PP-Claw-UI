import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => apiClient.getSessions(),
    refetchInterval: 10000,
  });
}

export function useSession(key: string) {
  return useQuery({
    queryKey: ["sessions", key],
    queryFn: () => apiClient.getSession(key),
    enabled: !!key,
    refetchInterval: 5000,
  });
}

export function useClearSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => apiClient.clearSession(key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
