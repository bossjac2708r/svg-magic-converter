import { useCallback, useState } from "react";
import { FolderOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MAX_FILES_PER_FOLDER, MAX_FOLDERS } from "@/types/converter";

interface FolderUploadZoneProps {
  folderIndex: number;
  folderName?: string;
  fileCount: number;
  onFolderAdded: (folderIndex: number, files: File[], folderName: string) => void;
  onClearFolder: (folderIndex: number) => void;
  disabled?: boolean;
}

export const FolderUploadZone = ({
  folderIndex,
  folderName,
  fileCount,
  onFolderAdded,
  onClearFolder,
  disabled,
}: FolderUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFiles = (files: File[]): File[] => {
    const validFiles = files.filter((file) => {
      const isValidType = file.type === "image/png" || file.type === "image/jpeg";
      if (!isValidType) return false;
      return file.size <= 50 * 1024 * 1024;
    });

    if (validFiles.length > MAX_FILES_PER_FOLDER) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES_PER_FOLDER} files per folder`,
        variant: "destructive",
      });
      return validFiles.slice(0, MAX_FILES_PER_FOLDER);
    }

    return validFiles;
  };

  const extractFolderName = (items: DataTransferItemList | null, files: FileList): string => {
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry?.isDirectory) {
          return entry.name;
        }
      }
    }
    // Fallback: extract from first file path or use default name
    const firstFile = files[0];
    if (firstFile && (firstFile as any).webkitRelativePath) {
      const path = (firstFile as any).webkitRelativePath;
      return path.split('/')[0] || `Folder ${folderIndex + 1}`;
    }
    return `Folder ${folderIndex + 1}`;
  };

  const handleFiles = useCallback(
    async (files: FileList | null, items?: DataTransferItemList) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);
      const name = extractFolderName(items || null, files);

      if (validFiles.length > 0) {
        onFolderAdded(folderIndex, validFiles, name);
        toast({
          title: "Folder added",
          description: `${validFiles.length} images from "${name}"`,
        });
      }
    },
    [folderIndex, onFolderAdded, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files, e.dataTransfer.items);
    },
    [handleFiles, disabled]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files, undefined);
    e.target.value = "";
  };

  if (folderName && fileCount > 0) {
    return (
      <div className="border-2 border-primary/30 rounded-xl p-4 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold truncate max-w-[150px]">{folderName}</h4>
              <p className="text-sm text-muted-foreground">{fileCount} images</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClearFolder(folderIndex)}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      className={`
        relative border-2 border-dashed rounded-xl p-6 text-center
        transition-all duration-300 cursor-pointer
        ${isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/50 bg-card"}
        ${disabled ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        {...({ webkitdirectory: "", directory: "" } as any)}
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-2">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-gradient-primary" : "bg-accent"}`}>
          <Plus className={`h-6 w-6 ${isDragging ? "text-white" : "text-muted-foreground"}`} />
        </div>
        <p className="font-medium text-sm">Folder {folderIndex + 1}</p>
        <p className="text-xs text-muted-foreground">Drop folder or click</p>
      </div>
    </div>
  );
};
