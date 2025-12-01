import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { createNewProject, getProjectDetails, sendMessageSSE } from "../../services/projectService";

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

export interface SendMessageCallbacks {
  onMessage?: (message: string) => void;
  onFileWrite?: (data: { files: string[]; message: string }) => void;
  onFileRead?: (data: { files: string[]; message: string }) => void;
  onTerminal?: (data: { command?: string; output?: string; message: string }) => void;
  onComplete?: (data: { sandbox_id: string; summary: string }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send a message via SSE (Server-Sent Events)
 */
export const useSendMessage = (projectId: string | undefined) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (message: string, callbacks?: SendMessageCallbacks) => {
      if (!projectId) {
        const err = new Error("Project ID is required");
        setError(err);
        callbacks?.onError?.(err);
        return;
      }

      setIsPending(true);
      setError(null);

      await sendMessageSSE(projectId, message, {
        onMessage: (msg) => {
          callbacks?.onMessage?.(msg);
        },
        onFileWrite: (data) => {
          callbacks?.onFileWrite?.(data);
        },
        onFileRead: (data) => {
          callbacks?.onFileRead?.(data);
        },
        onTerminal: (data) => {
          callbacks?.onTerminal?.(data);
        },
        onComplete: (data) => {
          setIsPending(false);
          callbacks?.onComplete?.(data);
        },
        onError: (err) => {
          setIsPending(false);
          setError(err);
          callbacks?.onError?.(err);
        },
      });
    },
    [projectId]
  );

  return {
    sendMessage,
    isPending,
    error,
  };
};