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

export interface ConversionSettings {
  smoothness: number;
  noiseReduction: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  status: FileStatus;
  originalUrl: string;
  svgString?: string;
  svgBlob?: Blob;
  mode: ConversionMode;
  error?: string;
  path?: string; // Original folder path
  conversionTime?: number; // Time taken to convert in ms
}

export interface ConversionStats {
  totalFiles: number;
  converted: number;
  failed: number;
  startTime: number | null;
  endTime: number | null;
  averageSpeed: number; // Images per second
}

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mode, setMode] = useState<ConversionMode>("blackwhite");
  const [settings, setSettings] = useState<ConversionSettings>({
    smoothness: 1,
    noiseReduction: 1,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [stats, setStats] = useState<ConversionStats>({
    totalFiles: 0,
    converted: 0,
    failed: 0,
    startTime: null,
    endTime: null,
    averageSpeed: 0,
  });
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleFilesAdded = (newFiles: File[], folderPaths?: string[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: crypto.randomUUID(),
      file,
      status: "queued" as FileStatus,
      originalUrl: URL.createObjectURL(file),
      mode,
      path: folderPaths?.[index],
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
    toast({
      title: "Files added",
      description: `${newFiles.length} file(s) ready for conversion`,
    });
  };

  const convertFile = async (uploadedFile: UploadedFile) => {
    const startTime = Date.now();
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
            const conversionTime = Date.now() - startTime;
            
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? {
                      ...f,
                      status: "ready" as FileStatus,
                      svgString: e.data.svgString,
                      svgBlob,
                      conversionTime,
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
          settings,
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
    const startTime = Date.now();
    
    // Initialize stats
    const queuedFiles = files.filter((f) => f.status === "queued");
    setStats({
      totalFiles: queuedFiles.length,
      converted: 0,
      failed: 0,
      startTime,
      endTime: null,
      averageSpeed: 0,
    });

    try {
      // Process files in parallel batches of 6
      const batchSize = 6;
      
      for (let i = 0; i < queuedFiles.length; i += batchSize) {
        const batch = queuedFiles.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map((file) => convertFile(file)));
        
        // Update stats after each batch
        const converted = files.filter((f) => f.status === "ready").length;
        const failed = files.filter((f) => f.status === "error").length;
        const elapsed = (Date.now() - startTime) / 1000;
        const averageSpeed = converted / elapsed;
        
        setStats((prev) => ({
          ...prev,
          converted,
          failed,
          averageSpeed,
        }));
      }

      const endTime = Date.now();
      const converted = files.filter((f) => f.status === "ready").length;
      const failed = files.filter((f) => f.status === "error").length;
      const elapsed = (endTime - startTime) / 1000;
      
      setStats({
        totalFiles: queuedFiles.length,
        converted,
        failed,
        startTime,
        endTime,
        averageSpeed: converted / elapsed,
      });

      setShowReport(true);
      
      toast({
        title: "Conversion complete!",
        description: `${converted} converted, ${failed} failed`,
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

      // Preserve folder structure if paths exist
      readyFiles.forEach((file) => {
        const fileName = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
        const fullPath = file.path ? `${file.path}/${fileName}` : fileName;
        
        if (file.svgBlob) {
          zip.file(fullPath, file.svgBlob);
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

      // Auto-delete files from memory after download
      setTimeout(() => {
        files.forEach((file) => URL.revokeObjectURL(file.originalUrl));
        setFiles([]);
        toast({
          title: "Files cleared",
          description: "All files removed from memory for privacy",
        });
      }, 2000);

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
            Convert up to 500 images • WebAssembly-powered • No uploads • Lightning fast
          </p>
        </section>

        {/* Upload Zone */}
        <section className="mb-8 animate-in fade-in duration-700 delay-100">
          <UploadZone onFilesAdded={handleFilesAdded} maxFiles={500} />
        </section>

        {/* Conversion Options */}
        <section className="mb-8 animate-in fade-in duration-700 delay-200">
          <ConversionOptions 
            mode={mode} 
            onModeChange={setMode}
            settings={settings}
            onSettingsChange={setSettings}
          />
        </section>

        {/* File List */}
        {files.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-700 delay-300">
            <FileList
              files={files}
              isConverting={isConverting}
              stats={stats}
              showReport={showReport}
              onConvert={handleConvert}
              onDownloadAll={handleDownloadAll}
              onDownloadSingle={handleDownloadSingle}
              onCloseReport={() => setShowReport(false)}
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
