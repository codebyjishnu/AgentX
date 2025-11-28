import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewProject, getProjectDetails } from "../../services/projectService";

// Query keys for projects
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: unknown) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  new: () => [...projectKeys.all, "new"] as const,
};

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createNewProject(),
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * Hook to fetch project details by ID
 */
export const useProjectDetails = (projectId: string | undefined) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? ""),
    queryFn: () => getProjectDetails(projectId!),
    enabled: !!projectId,
  });
};