import { useState } from "react";
import { Zap, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Header } from "@/components/turbo/Header";
import { UploadZone } from "@/components/turbo/UploadZone";
import { ConversionOptions } from "@/components/turbo/ConversionOptions";
import { FileList } from "@/components/turbo/FileList";
import { FAQSection } from "@/components/turbo/FAQSection";
import { Footer } from "@/components/turbo/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { loadImageFromFile, imageToImageData } from "@/lib/imageTracer";
import JSZip from "jszip";

export type ConversionMode = "blackwhite" | "posterize";
export type FileStatus = "queued" | "processing" | "ready" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  status: FileStatus;
  originalUrl: string;
  svgString?: string;
  svgBlob?: Blob;
  mode: ConversionMode;
  error?: string;
}

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mode, setMode] = useState<ConversionMode>("blackwhite");
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleFilesAdded = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "queued" as FileStatus,
      originalUrl: URL.createObjectURL(file),
      mode,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
    toast({
      title: "Files added",
      description: `${newFiles.length} file(s) ready for conversion`,
    });
  };

  const convertFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, status: "processing" as FileStatus } : f
        )
      );

      // Load and convert image
      const img = await loadImageFromFile(uploadedFile.file);
      const imageData = imageToImageData(img);

      // Create worker for conversion
      const worker = new Worker(
        new URL("../lib/conversionWorker.ts", import.meta.url),
        { type: "module" }
      );

      return new Promise<void>((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.type === "success") {
            const svgBlob = new Blob([e.data.svgString], { type: "image/svg+xml" });
            
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? {
                      ...f,
                      status: "ready" as FileStatus,
                      svgString: e.data.svgString,
                      svgBlob,
                    }
                  : f
              )
            );
            worker.terminate();
            resolve();
          } else if (e.data.type === "error") {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? {
                      ...f,
                      status: "error" as FileStatus,
                      error: e.data.error,
                    }
                  : f
              )
            );
            worker.terminate();
            reject(new Error(e.data.error));
          }
        };

        worker.onerror = (error) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: "error" as FileStatus, error: error.message }
                : f
            )
          );
          worker.terminate();
          reject(error);
        };

        worker.postMessage({
          type: "convert",
          imageData,
          mode: uploadedFile.mode,
          fileId: uploadedFile.id,
          fileName: uploadedFile.file.name,
        });
      });
    } catch (error) {
      console.error("Conversion error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error" as FileStatus,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            : f
        )
      );
      throw error;
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No files",
        description: "Please upload files first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      // Process files in parallel batches of 4
      const batchSize = 4;
      const queuedFiles = files.filter((f) => f.status === "queued");
      
      for (let i = 0; i < queuedFiles.length; i += batchSize) {
        const batch = queuedFiles.slice(i, i + batchSize);
        await Promise.allSettled(batch.map((file) => convertFile(file)));
      }

      toast({
        title: "Conversion complete!",
        description: "All files have been converted to SVG",
      });
    } catch (error) {
      console.error("Batch conversion error:", error);
      toast({
        title: "Some conversions failed",
        description: "Check the file list for details",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAll = async () => {
    const readyFiles = files.filter((f) => f.status === "ready" && f.svgBlob);

    if (readyFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Convert some files first",
        variant: "destructive",
      });
      return;
    }

    try {
      const zip = new JSZip();

      readyFiles.forEach((file) => {
        const fileName = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
        if (file.svgBlob) {
          zip.file(fileName, file.svgBlob);
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "svg-conversions.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `${readyFiles.length} files in ZIP`,
      });
    } catch (error) {
      console.error("ZIP creation error:", error);
      toast({
        title: "Download failed",
        description: "Error creating ZIP file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSingle = (file: UploadedFile) => {
    if (!file.svgBlob) return;

    const url = URL.createObjectURL(file.svgBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-accent">
      <Header />

      {/* Theme toggle */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full shadow-medium"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Offline Processing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            SVG Turbo Converter
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Fastest Offline JPG/PNG to SVG Converter
          </p>
          <p className="text-sm text-muted-foreground">
            Convert up to 200 images • WebAssembly-powered • No uploads • Lightning fast
          </p>
        </section>

        {/* Upload Zone */}
        <section className="mb-8 animate-in fade-in duration-700 delay-100">
          <UploadZone onFilesAdded={handleFilesAdded} maxFiles={200} />
        </section>

        {/* Conversion Options */}
        <section className="mb-8 animate-in fade-in duration-700 delay-200">
          <ConversionOptions mode={mode} onModeChange={setMode} />
        </section>

        {/* File List */}
        {files.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-700 delay-300">
            <FileList
              files={files}
              isConverting={isConverting}
              onConvert={handleConvert}
              onDownloadAll={handleDownloadAll}
              onDownloadSingle={handleDownloadSingle}
            />
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-8 animate-in fade-in duration-700 delay-400">
          <FAQSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
