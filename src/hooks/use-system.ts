import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useSystemStatus() {
  return useQuery({
    queryKey: ["system", "status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 10000,
  });
}

export function useSystemVersion() {
  return useQuery({
    queryKey: ["system", "version"],
    queryFn: () => apiClient.getVersion(),
    staleTime: 60000,
  });
}
