import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useChannelsStatus() {
  return useQuery({
    queryKey: ["channels", "status"],
    queryFn: () => apiClient.getChannelsStatus(),
    refetchInterval: 15000,
  });
}
