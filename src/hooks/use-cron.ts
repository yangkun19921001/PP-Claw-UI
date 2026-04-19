import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { CronSchedule } from "@/types/api";

export function useCronJobs() {
  return useQuery({
    queryKey: ["cron", "jobs"],
    queryFn: () => apiClient.getCronJobs(),
    refetchInterval: 30000,
  });
}

export function useCreateCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (job: {
      name: string;
      message: string;
      schedule: CronSchedule;
      deliver?: boolean;
      channel?: string;
      account?: string;
      to?: string;
      delete_after_run?: boolean;
    }) => apiClient.createCronJob(job),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cron"] });
    },
  });
}

export function useDeleteCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteCronJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cron"] });
    },
  });
}

export function useToggleCronJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiClient.enableCronJob(id, enabled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cron"] });
    },
  });
}
