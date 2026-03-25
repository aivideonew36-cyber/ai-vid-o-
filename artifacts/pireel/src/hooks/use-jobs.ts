import { useQueryClient } from "@tanstack/react-query";
import { 
  useListJobs as useGeneratedListJobs,
  useCreateJob as useGeneratedCreateJob,
  useGetJob as useGeneratedGetJob,
  useDeleteJob as useGeneratedDeleteJob,
  getListJobsQueryKey
} from "@workspace/api-client-react";

// Wrapper to add polling for list
export function useJobs(poll = false) {
  return useGeneratedListJobs({
    query: {
      refetchInterval: poll ? 2000 : false,
    }
  });
}

// Wrapper to add polling for a specific job
export function useJobDetail(id: string) {
  return useGeneratedGetJob(id, {
    query: {
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return (status === 'queued' || status === 'processing') ? 1000 : false;
      }
    }
  });
}

// Wrappers for mutations to handle cache invalidation
export function useCreateVideoJob() {
  const queryClient = useQueryClient();
  const mutation = useGeneratedCreateJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      }
    }
  });
  return mutation;
}

export function useDeleteVideoJob() {
  const queryClient = useQueryClient();
  const mutation = useGeneratedDeleteJob({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      }
    }
  });
  return mutation;
}
