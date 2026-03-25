import { 
  useGetPipelineStatus,
  useGetCheckpoints,
  useGetTools
} from "@workspace/api-client-react";

export function usePipeline() {
  const statusQuery = useGetPipelineStatus({
    query: { refetchInterval: 5000 }
  });
  
  const toolsQuery = useGetTools();
  
  const checkpointsQuery = useGetCheckpoints();

  return {
    status: statusQuery.data,
    isLoadingStatus: statusQuery.isLoading,
    tools: toolsQuery.data,
    isLoadingTools: toolsQuery.isLoading,
    checkpoints: checkpointsQuery.data,
    isLoadingCheckpoints: checkpointsQuery.isLoading
  };
}
