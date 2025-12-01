import { Clock, CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadedFile } from "@/pages/Index";

interface FileListProps {
  files: UploadedFile[];
}

export const FileList = ({ files }: FileListProps) => {
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

  const processingCount = files.filter((f) => f.status === "processing").length;
  const totalFiles = files.length;
  const progress = totalFiles > 0 ? ((totalFiles - processingCount) / totalFiles) * 100 : 0;

  return (
    <div className="space-y-4">
      {processingCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {totalFiles - processingCount} / {totalFiles} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
          >
            {/* Preview thumbnails */}
            <div className="flex gap-3">
              {/* Original preview */}
              <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                {file.file && (
                  <img
                    src={URL.createObjectURL(file.file)}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Arrow */}
              {file.status === "ready" && (
                <>
                  <div className="flex items-center justify-center text-muted-foreground">→</div>
                  
                  {/* SVG preview */}
                  <div className="h-16 w-16 rounded-lg border border-primary/50 bg-primary/5 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </>
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate mb-1">{file.file.name}</h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(file.status)}
                <span className={`text-sm font-medium ${getStatusColor(file.status)}`}>
                  {getStatusText(file.status)}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {file.mode === "blackwhite" ? "Black & White" : "Posterize (4 colors)"}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {(file.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {/* Download button */}
            {file.status === "ready" && (
              <Button
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
