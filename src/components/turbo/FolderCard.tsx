import { useState } from "react";
import {
  FolderOpen,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FolderData, UploadedFile } from "@/types/converter";

interface FolderCardProps {
  folder: FolderData;
  onDownloadAll: (folderId: string) => void;
  onDownloadSelected: (folderId: string) => void;
  onClearFolder: (folderId: string) => void;
  onRetryFailed: (folderId: string) => void;
  onToggleFileSelection: (folderId: string, fileId: string) => void;
  onSelectAll: (folderId: string, selected: boolean) => void;
  disabled?: boolean;
}

export const FolderCard = ({
  folder,
  onDownloadAll,
  onDownloadSelected,
  onClearFolder,
  onRetryFailed,
  onToggleFileSelection,
  onSelectAll,
  disabled,
}: FolderCardProps) => {
  const [expanded, setExpanded] = useState(true);

  const { files, stats, status, name } = folder;
  const readyCount = files.filter((f) => f.status === "ready").length;
  const failedCount = files.filter((f) => f.status === "error").length;
  const processingCount = files.filter((f) => f.status === "processing").length;
  const queuedCount = files.filter((f) => f.status === "queued").length;
  const selectedCount = files.filter((f) => f.selected && f.status === "ready").length;
  const progress = stats.totalFiles > 0 ? ((stats.converted + stats.failed) / stats.totalFiles) * 100 : 0;

  const getStatusBadge = () => {
    switch (status) {
      case "converting":
        return <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">Converting</span>;
      case "paused":
        return <span className="px-2 py-1 text-xs rounded-full bg-warning/20 text-warning">Paused</span>;
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-success/20 text-success">Completed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Ready</span>;
    }
  };

  const getFileStatusIcon = (fileStatus: UploadedFile["status"]) => {
    switch (fileStatus) {
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case "ready":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-accent/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold truncate max-w-[120px]" title={name}>{name}</h3>
          </div>
          {getStatusBadge()}
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
          <span>{files.length} files</span>
          <span>•</span>
          <span className="text-success">{readyCount} ready</span>
          {failedCount > 0 && (
            <>
              <span>•</span>
              <span className="text-destructive">{failedCount} failed</span>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      {status === "converting" && (
        <div className="p-4 bg-accent/10">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{stats.currentSpeed.toFixed(1)} img/s</span>
            </div>
            {stats.eta && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>ETA: {stats.eta}s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 min-h-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-2 flex items-center justify-between text-sm font-medium hover:bg-accent/20 transition-colors"
        >
          <span>Files ({files.length})</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expanded && (
          <ScrollArea className="h-[200px] px-2">
            <div className="space-y-1 pb-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  {file.status === "ready" && (
                    <Checkbox
                      checked={file.selected}
                      onCheckedChange={() => onToggleFileSelection(folder.id, file.id)}
                      className="flex-shrink-0"
                    />
                  )}
                  <div className="h-8 w-8 rounded border border-border bg-muted overflow-hidden flex-shrink-0">
                    {file.status === "ready" && file.svgString ? (
                      <img
                        src={`data:image/svg+xml;base64,${btoa(file.svgString)}`}
                        alt="SVG"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <img
                        src={file.originalUrl}
                        alt={file.file.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{file.file.name}</p>
                    {file.error && <p className="text-xs text-destructive truncate">{file.error}</p>}
                  </div>
                  {getFileStatusIcon(file.status)}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border bg-accent/10 space-y-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onDownloadAll(folder.id)}
            disabled={readyCount === 0 || disabled}
            className="flex-1 text-xs bg-gradient-primary hover:opacity-90"
          >
            <Download className="h-3 w-3 mr-1" />
            ZIP ({readyCount})
          </Button>
          {selectedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownloadSelected(folder.id)}
              disabled={disabled}
              className="flex-1 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Selected ({selectedCount})
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {failedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRetryFailed(folder.id)}
              disabled={status === "converting" || disabled}
              className="flex-1 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry ({failedCount})
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onClearFolder(folder.id)}
            disabled={status === "converting" || disabled}
            className="text-xs text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        {readyCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={selectedCount === readyCount && readyCount > 0}
              onCheckedChange={(checked) => onSelectAll(folder.id, !!checked)}
              id={`select-all-${folder.id}`}
            />
            <label htmlFor={`select-all-${folder.id}`} className="cursor-pointer">Select all ready</label>
          </div>
        )}
      </div>
    </div>
  );
};
