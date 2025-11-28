import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewProject, getProjectDetails, sendMessage } from "../../services/projectService";

// Query keys for projects
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: unknown) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  new: () => [...projectKeys.all, "new"] as const,
  messages: (projectId: string) => [...projectKeys.all, "messages", projectId] as const,
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

/**
 * Hook to send a message in a project chat
 */
export const useSendMessage = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      return sendMessage(projectId, message);
    },
    onSuccess: () => {
      // Optionally invalidate messages or project details
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: projectKeys.messages(projectId) });
      }
    },
  });
};