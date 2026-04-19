import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useTools() {
  return useQuery({
    queryKey: ["tools"],
    queryFn: () => apiClient.getTools(),
  });
}

export function useTool(name: string) {
  return useQuery({
    queryKey: ["tools", name],
    queryFn: () => apiClient.getTool(name),
    enabled: !!name,
  });
}
