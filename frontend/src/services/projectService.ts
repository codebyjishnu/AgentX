/* eslint-disable @typescript-eslint/no-explicit-any */
import { privateClient } from "../utils/privateClient";



export async function createNewProject(): Promise<any> {
  try {
    const response = await privateClient.get("/project/new");
    const { data, status } = response;
    if (status) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return error;
  }
}

export async function getProjectDetails(projectId:string){
  try {
    const response = await privateClient.get(`/project/${projectId}/details`)
    const {data,status}=response;
    if (status) {
      return data;
    }else{
      return [];
    }
  } catch (error) {
    return error; 
  }
}

export interface SSEEvent {
  action: "message" | "file_creation" | "file_update" | "complete";
  message: string | { sandbox_id: string; summary: string };
  timestamp: number;
  data?: {
    filename?: string;
    path?: string;
    language?: string;
    changes?: number;
  };
}

export interface SSECallbacks {
  onMessage?: (message: string) => void;
  onFileCreation?: (data: { filename: string; path: string; language: string; message: string }) => void;
  onFileUpdate?: (data: { filename: string; path: string; changes: number; message: string }) => void;
  onComplete?: (data: { sandbox_id: string; summary: string }) => void;
  onError?: (error: Error) => void;
}

export async function sendMessageSSE(
  projectId: string,
  message: string,
  callbacks: SSECallbacks
): Promise<void> {
  const token = sessionStorage.getItem("access_token");
  const baseUrl = import.meta.env.VITE_API_URL;

  try {
    const response = await fetch(`${baseUrl}/project/${projectId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE format: data: {...}\n\n
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (!data) continue;

          try {
            const parsed: SSEEvent = JSON.parse(data);

            switch (parsed.action) {
              case "message":
                if (typeof parsed.message === "string") {
                  callbacks.onMessage?.(parsed.message);
                }
                break;

              case "file_creation":
                if (parsed.data && typeof parsed.message === "string") {
                  callbacks.onFileCreation?.({
                    filename: parsed.data.filename || "",
                    path: parsed.data.path || "",
                    language: parsed.data.language || "",
                    message: parsed.message,
                  });
                }
                break;

              case "file_update":
                if (parsed.data && typeof parsed.message === "string") {
                  callbacks.onFileUpdate?.({
                    filename: parsed.data.filename || "",
                    path: parsed.data.path || "",
                    changes: parsed.data.changes || 0,
                    message: parsed.message,
                  });
                }
                break;

              case "complete":
                if (typeof parsed.message === "object") {
                  callbacks.onComplete?.(parsed.message);
                }
                return;
            }
          } catch {
            // If not valid JSON, skip
            console.warn("Failed to parse SSE data:", data);
          }
        }
      }
    }
  } catch (error) {
    callbacks.onError?.(error as Error);
  }
}