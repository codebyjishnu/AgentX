import { useState, useEffect, useCallback } from "react"
import { ScrollArea } from "./ui/scroll-area"
import { sandboxApi } from "../lib/api"
import type { SandboxFileEntry, SandboxFileContent } from "../lib/api"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Loader2 } from "lucide-react"

interface CodeBasePreviewProps {
  sandboxId?: string
}

interface FileTreeNode extends SandboxFileEntry {
  children?: FileTreeNode[]
  isExpanded?: boolean
  isLoading?: boolean
}

// Build a tree structure from flat file list
const buildFileTree = (flatFiles: SandboxFileEntry[]): FileTreeNode[] => {
  const nodeMap = new Map<string, FileTreeNode>()

  // Create nodes for all entries
  flatFiles.forEach(file => {
    nodeMap.set(file.path, { ...file, children: [], isExpanded: false })
  })

  const rootNodes: FileTreeNode[] = []

  // Organize into tree structure
  flatFiles.forEach(file => {
    const node = nodeMap.get(file.path)!
    const parentPath = file.path.substring(0, file.path.lastIndexOf('/'))
    const parentNode = nodeMap.get(parentPath)

    if (parentNode) {
      parentNode.children = parentNode.children || []
      parentNode.children.push(node)
    } else {
      rootNodes.push(node)
    }
  })

  // Sort: directories first, then alphabetically
  const sortNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.sort((a, b) => {
      if (a.type === "dir" && b.type !== "dir") return -1
      if (a.type !== "dir" && b.type === "dir") return 1
      return a.name.localeCompare(b.name)
    }).map(node => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined
    }))
  }

  return sortNodes(rootNodes)
}

const CodeBasePreview = ({ sandboxId}: CodeBasePreviewProps) => {
  const [files, setFiles] = useState<FileTreeNode[]>([])
  const [selectedFile, setSelectedFile] = useState<SandboxFileContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)

  const loadFiles = useCallback(async () => {
    if (!sandboxId) return []
    const response = await sandboxApi.listFiles(sandboxId)
    console.log("loadFiles response:", response)
    if (response.success && response.data) {
      return buildFileTree(response.data)
    }
    return []
  }, [sandboxId])

  useEffect(() => {
    const fetchRootFiles = async () => {
      if (!sandboxId) return
      setIsLoading(true)
      setError(null)
      try {
        const rootFiles = await loadFiles()
        setFiles(rootFiles)
      } catch (err) {
        console.error("Failed to load files:", err)
        setError("Failed to load files")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRootFiles()
  }, [sandboxId, loadFiles])

  const toggleFolder = (node: FileTreeNode) => {
    if (node.type !== "dir") return

    const updateNode = (nodes: FileTreeNode[], targetPath: string): FileTreeNode[] => {
      return nodes.map(n => {
        if (n.path === targetPath) {
          return { ...n, isExpanded: !n.isExpanded }
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children, targetPath) }
        }
        return n
      })
    }

    setFiles(prev => updateNode(prev, node.path))
  }

  const handleFileClick = async (node: FileTreeNode) => {
    if (node.type === "dir") {
      toggleFolder(node)
      return
    }
    if (!sandboxId) return
    setIsLoadingContent(true)
    try {
      const response = await sandboxApi.readFile(sandboxId, node.path)
      if (response.success && response.data) {
        setSelectedFile({ path: node.path, content: response.data as unknown as string })
      }
    } catch (err) {
      console.error("Failed to read file:", err)
    } finally {
      setIsLoadingContent(false)
    }
  }

  const renderFileTree = (nodes: FileTreeNode[], depth: number = 0) => {
    return nodes.map(node => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-secondary/50 rounded text-sm ${
            selectedFile?.path === node.path ? "bg-secondary" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {node.type === "dir" ? (
            <>
              {node.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : node.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {node.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-yellow-500" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-500" />
              )}
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-blue-400" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === "dir" && node.isExpanded && node.children && (
          renderFileTree(node.children, depth + 1)
        )}
      </div>
    ))
  }

  if (!sandboxId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>No sandbox available</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      <div className="w-64 border-r border-border/50 flex flex-col">
        <div className="p-2 border-b border-border/50 text-sm font-medium text-muted-foreground">
          Files
        </div>
        <ScrollArea className="flex-1">
          <div className="py-1">
            {renderFileTree(files)}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        {isLoadingContent ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : selectedFile ? (
          <>
            <div className="p-2 border-b border-border/50 text-sm font-medium text-muted-foreground">
              {selectedFile.path}
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-all">
                {selectedFile.content}
              </pre>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a file to view its content</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeBasePreview