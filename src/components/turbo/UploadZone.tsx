import { useCallback, useState } from "react";
import { Upload, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onFilesAdded: (files: File[], folderPaths?: string[]) => void;
  maxFiles: number;
}

export const UploadZone = ({ onFilesAdded, maxFiles }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFiles = (files: File[]): File[] => {
    const validFiles = files.filter((file) => {
      const isValidType = file.type === "image/png" || file.type === "image/jpeg";
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a PNG or JPG file`,
          variant: "destructive",
        });
        return false;
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return validFiles.slice(0, maxFiles);
    }

    return validFiles;
  };

  const handleFiles = useCallback(
    (files: FileList | null, items?: DataTransferItemList) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);

      // Extract folder paths if available
      let folderPaths: string[] | undefined;
      if (items) {
        folderPaths = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === "file") {
            const entry = item.webkitGetAsEntry?.();
            if (entry) {
              const path = entry.fullPath?.split("/").slice(0, -1).join("/") || "";
              folderPaths.push(path.startsWith("/") ? path.slice(1) : path);
            }
          }
        }
      }

      if (validFiles.length > 0) {
        onFilesAdded(validFiles, folderPaths);
      }
    },
    [onFilesAdded, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files, e.dataTransfer.items);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files, undefined);
    e.target.value = ""; // Reset input
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center
        transition-all duration-300 cursor-pointer group
        ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 bg-card"
        }
        shadow-soft hover:shadow-medium
      `}
    >
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload files"
        {...({ webkitdirectory: "", directory: "" } as any)}
      />

      <div className="flex flex-col items-center gap-4">
        <div
          className={`
          h-20 w-20 rounded-full flex items-center justify-center
          transition-all duration-300
          ${
            isDragging
              ? "bg-gradient-primary scale-110"
              : "bg-gradient-accent group-hover:bg-gradient-primary"
          }
        `}
        >
          {isDragging ? (
            <FileImage className="h-10 w-10 text-white" />
          ) : (
            <Upload className="h-10 w-10 text-primary group-hover:text-white transition-colors" />
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragging ? "Drop your files here" : "Upload Images"}
          </h3>
          <p className="text-muted-foreground mb-1">
            Drag & drop or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            PNG or JPG • Up to {maxFiles} files • Max 50MB each
          </p>
        </div>
      </div>
    </div>
  );
};
