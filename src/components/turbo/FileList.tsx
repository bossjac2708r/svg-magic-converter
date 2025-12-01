import { Clock, CheckCircle2, AlertCircle, Loader2, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadedFile } from "@/pages/Index";

interface FileListProps {
  files: UploadedFile[];
  isConverting: boolean;
  onConvert: () => void;
  onDownloadAll: () => void;
  onDownloadSingle: (file: UploadedFile) => void;
}

export const FileList = ({
  files,
  isConverting,
  onConvert,
  onDownloadAll,
  onDownloadSingle,
}: FileListProps) => {
  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "ready":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "queued":
        return "Queued";
      case "processing":
        return "Processing";
      case "ready":
        return "Ready";
      case "error":
        return "Error";
    }
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "queued":
        return "text-muted-foreground";
      case "processing":
        return "text-primary";
      case "ready":
        return "text-success";
      case "error":
        return "text-destructive";
    }
  };

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const processingCount = files.filter((f) => f.status === "processing").length;
  const readyCount = files.filter((f) => f.status === "ready").length;
  const totalFiles = files.length;
  const progress = totalFiles > 0 ? (readyCount / totalFiles) * 100 : 0;

  return (
    <div className="bg-card rounded-lg border border-border shadow-soft p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Files</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {readyCount} ready • {processingCount} processing • {queuedCount} queued
          </p>
        </div>
        <div className="flex gap-3">
          {queuedCount > 0 && (
            <Button
              onClick={onConvert}
              disabled={isConverting}
              className="bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Convert All ({queuedCount})
                </>
              )}
            </Button>
          )}
          {readyCount > 0 && (
            <Button
              onClick={onDownloadAll}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Download All as ZIP ({readyCount})
            </Button>
          )}
        </div>
      </div>

      {processingCount > 0 && (
        <div className="mb-6 bg-accent/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {readyCount} / {totalFiles} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors"
          >
            {/* Preview thumbnails */}
            <div className="flex gap-3 items-center">
              {/* Original preview */}
              <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={file.originalUrl}
                  alt={file.file.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Arrow and SVG preview */}
              {file.status === "ready" && file.svgString && (
                <>
                  <div className="flex items-center justify-center text-muted-foreground">→</div>

                  {/* SVG preview */}
                  <div className="h-16 w-16 rounded-lg border border-primary/50 bg-primary/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={`data:image/svg+xml;base64,${btoa(file.svgString)}`}
                      alt="SVG preview"
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                </>
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate mb-1">{file.file.name}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusIcon(file.status)}
                <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                  {getStatusText(file.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {file.mode === "blackwhite" ? "B&W" : "Posterize"}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {(file.file.size / 1024).toFixed(1)} KB
                </span>
                {file.error && (
                  <span className="text-xs text-destructive">• {file.error}</span>
                )}
              </div>
            </div>

            {/* Download button */}
            {file.status === "ready" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadSingle(file)}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex-shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
