import { useState } from "react";
import { X, ZoomIn, Download, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { UploadedFile } from "@/types/converter";

interface GalleryPreviewProps {
  files: UploadedFile[];
  onDownload: (file: UploadedFile) => void;
}

export const GalleryPreview = ({ files, onDownload }: GalleryPreviewProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const readyFiles = files.filter((f) => f.status === "ready" && f.svgString);

  if (readyFiles.length === 0) return null;

  const selectedFile = selectedIndex !== null ? readyFiles[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < readyFiles.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border shadow-soft p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Gallery Preview</h3>
          <span className="text-sm text-muted-foreground">{readyFiles.length} converted</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {readyFiles.map((file, index) => (
            <button
              key={file.id}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square rounded-lg border-2 border-border hover:border-primary bg-muted overflow-hidden transition-all cursor-pointer"
            >
              <img
                src={`data:image/svg+xml;base64,${btoa(file.svgString!)}`}
                alt={file.file.name}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-card">
          {selectedFile && (
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h4 className="font-semibold truncate">{selectedFile.file.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.mode === "blackwhite" ? "Black & White" : "Posterize"} • 
                    {selectedFile.conversionTime ? ` ${(selectedFile.conversionTime / 1000).toFixed(2)}s` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(selectedFile)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelectedIndex(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image Comparison */}
              <div className="grid grid-cols-2 gap-4 p-6">
                <div>
                  <p className="text-sm font-medium mb-2 text-center">Original</p>
                  <div className="aspect-square bg-muted rounded-lg border border-border overflow-hidden">
                    <img
                      src={selectedFile.originalUrl}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-center">SVG</p>
                  <div className="aspect-square bg-muted rounded-lg border border-primary/50 overflow-hidden">
                    <img
                      src={`data:image/svg+xml;base64,${btoa(selectedFile.svgString!)}`}
                      alt="SVG"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={selectedIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {(selectedIndex || 0) + 1} / {readyFiles.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  disabled={selectedIndex === readyFiles.length - 1}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
