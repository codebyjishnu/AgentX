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
  action: "message" | "file_write" | "file_read" | "terminal" | "complete" | "error";
  message: string;
  timestamp: number;
  data?: {
    files?: string[];
    command?: string;
    output?: string;
    sandbox_id?: string;
    summary?: string;
  };
}

export interface SSECallbacks {
  onMessage?: (message: string) => void;
  onFileWrite?: (data: { files: string[]; message: string }) => void;
  onFileRead?: (data: { files: string[]; message: string }) => void;
  onTerminal?: (data: { command?: string; output?: string; message: string }) => void;
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
                callbacks.onMessage?.(parsed.message);
                break;

              case "file_write":
                callbacks.onFileWrite?.({
                  files: parsed.data?.files || [],
                  message: parsed.message,
                });
                break;

              case "file_read":
                callbacks.onFileRead?.({
                  files: parsed.data?.files || [],
                  message: parsed.message,
                });
                break;

              case "terminal":
                callbacks.onTerminal?.({
                  command: parsed.data?.command,
                  output: parsed.data?.output,
                  message: parsed.message,
                });
                break;

              case "complete":
                callbacks.onComplete?.({
                  sandbox_id: parsed.data?.sandbox_id || "",
                  summary: parsed.data?.summary || parsed.message,
                });
                return;

              case "error":
                callbacks.onError?.(new Error(parsed.message));
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