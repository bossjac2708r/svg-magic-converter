import { useState, useCallback } from "react";
import { Zap, Moon, Sun, Circle, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { Header } from "@/components/turbo/Header";
import { FolderUploadZone } from "@/components/turbo/FolderUploadZone";
import { FolderCard } from "@/components/turbo/FolderCard";
import { GlobalControls } from "@/components/turbo/GlobalControls";
import { FinalReport } from "@/components/turbo/FinalReport";
import { FAQSection } from "@/components/turbo/FAQSection";
import { Footer } from "@/components/turbo/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useConversionEngine } from "@/hooks/useConversionEngine";
import JSZip from "jszip";
import type { ConversionMode, ConversionSettings, DEFAULT_SETTINGS, MAX_FOLDERS } from "@/types/converter";

const Index = () => {
  const [mode, setMode] = useState<ConversionMode>("blackwhite");
  const [settings, setSettings] = useState<ConversionSettings>({
    smoothness: 1,
    noiseReduction: 1,
    concurrency: 4,
    downscaleEnabled: false,
    downscaleMaxWidth: 1920,
  });
  const [showReport, setShowReport] = useState(false);
  
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const {
    folders,
    isConverting,
    isPaused,
    globalStats,
    addFolder,
    clearFolder,
    clearFolderByIndex,
    retryFailed,
    toggleFileSelection,
    selectAllInFolder,
    startAllConversions,
    pauseResume,
    cancelConversion,
    clearAllAfterDownload,
  } = useConversionEngine({ settings, mode });

  const handleStartAll = useCallback(async () => {
    if (folders.length === 0) {
      toast({
        title: "No folders",
        description: "Please add at least one folder",
        variant: "destructive",
      });
      return;
    }
    await startAllConversions();
    setShowReport(true);
    toast({
      title: "Conversion complete!",
      description: `${globalStats.converted} converted, ${globalStats.failed} failed`,
    });
  }, [folders.length, startAllConversions, globalStats, toast]);

  const handleDownloadFolder = useCallback(async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const readyFiles = folder.files.filter((f) => f.status === "ready" && f.svgBlob);
    if (readyFiles.length === 0) {
      toast({ title: "No files ready", variant: "destructive" });
      return;
    }

    const zip = new JSZip();
    readyFiles.forEach((file) => {
      const fileName = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
      if (file.svgBlob) zip.file(fileName, file.svgBlob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder.name}-svg.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Download started", description: `${readyFiles.length} files in ZIP` });
  }, [folders, toast]);

  const handleDownloadSelected = useCallback(async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const selectedFiles = folder.files.filter((f) => f.selected && f.status === "ready" && f.svgBlob);
    if (selectedFiles.length === 0) {
      toast({ title: "No files selected", variant: "destructive" });
      return;
    }

    const zip = new JSZip();
    selectedFiles.forEach((file) => {
      const fileName = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
      if (file.svgBlob) zip.file(fileName, file.svgBlob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder.name}-selected.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Download started", description: `${selectedFiles.length} selected files` });
  }, [folders, toast]);

  const handleDownloadAllFolders = useCallback(async () => {
    const allReadyFiles = folders.flatMap((folder) =>
      folder.files
        .filter((f) => f.status === "ready" && f.svgBlob)
        .map((f) => ({ ...f, folderName: folder.name }))
    );

    if (allReadyFiles.length === 0) {
      toast({ title: "No files ready", variant: "destructive" });
      return;
    }

    const zip = new JSZip();
    allReadyFiles.forEach((file) => {
      const fileName = file.file.name.replace(/\.(png|jpg|jpeg)$/i, ".svg");
      const fullPath = `${file.folderName}/${fileName}`;
      if (file.svgBlob) zip.file(fullPath, file.svgBlob);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-folders-svg.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Auto-clear after download
    setTimeout(() => {
      clearAllAfterDownload();
      toast({
        title: "Files cleared",
        description: "All files removed from memory for privacy",
      });
    }, 2000);

    toast({ title: "Download started", description: `${allReadyFiles.length} files from all folders` });
  }, [folders, clearAllAfterDownload, toast]);

  const handleStartPause = useCallback(() => {
    if (!isConverting) {
      handleStartAll();
    } else {
      pauseResume();
    }
  }, [isConverting, handleStartAll, pauseResume]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStartPause: handleStartPause,
    onCancel: cancelConversion,
    onDownload: handleDownloadAllFolders,
    enabled: folders.length > 0,
  });

  const totalReadyFiles = folders.reduce(
    (acc, f) => acc + f.files.filter((fl) => fl.status === "ready").length,
    0
  );
  const totalQueuedFiles = folders.reduce(
    (acc, f) => acc + f.files.filter((fl) => fl.status === "queued").length,
    0
  );
  const canStart = totalQueuedFiles > 0 && !isConverting;

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
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center mb-8 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">100% Offline • 3 Folders • 360 Images</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            SVG Turbo Converter
          </h1>
          <p className="text-lg text-muted-foreground">
            Ultra-fast folder-aware batch conversion • WebAssembly-powered
          </p>
        </section>

        {/* Conversion Mode Selection */}
        <section className="mb-8 animate-in fade-in duration-700 delay-100">
          <Card className="p-6 shadow-soft border-border bg-card">
            <h2 className="text-lg font-semibold mb-4">Conversion Mode</h2>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as ConversionMode)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <label
                htmlFor="blackwhite"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  mode === "blackwhite" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="blackwhite" id="blackwhite" />
                <Circle className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="blackwhite" className="font-semibold cursor-pointer">Black & White</Label>
                  <p className="text-xs text-muted-foreground">2-color tracing, fastest</p>
                </div>
              </label>
              <label
                htmlFor="posterize"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  mode === "posterize" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="posterize" id="posterize" />
                <Layers className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="posterize" className="font-semibold cursor-pointer">Posterize (4 Colors)</Label>
                  <p className="text-xs text-muted-foreground">More detail, richer output</p>
                </div>
              </label>
            </RadioGroup>
          </Card>
        </section>

        {/* 3-Column Folder Upload */}
        <section className="mb-8 animate-in fade-in duration-700 delay-200">
          <h2 className="text-lg font-semibold mb-4">Upload Folders (Max 3)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <FolderUploadZone
                key={index}
                folderIndex={index}
                folderName={folders[index]?.name}
                fileCount={folders[index]?.files.length || 0}
                onFolderAdded={addFolder}
                onClearFolder={clearFolderByIndex}
                disabled={isConverting}
              />
            ))}
          </div>
        </section>

        {/* Global Controls */}
        {folders.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-700 delay-300">
            <GlobalControls
              stats={globalStats}
              settings={settings}
              onSettingsChange={setSettings}
              isConverting={isConverting}
              isPaused={isPaused}
              canStart={canStart}
              onStartAll={handleStartAll}
              onPauseResume={pauseResume}
              onCancel={cancelConversion}
              onDownloadAllFolders={handleDownloadAllFolders}
              readyCount={totalReadyFiles}
            />
          </section>
        )}

        {/* Final Report */}
        {showReport && globalStats.endTime && (
          <section className="mb-8 animate-in fade-in duration-500">
            <FinalReport stats={globalStats} onClose={() => setShowReport(false)} />
          </section>
        )}

        {/* Folder Cards - 3 Column Layout */}
        {folders.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-700 delay-400">
            <h2 className="text-lg font-semibold mb-4">Processing Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onDownloadAll={handleDownloadFolder}
                  onDownloadSelected={handleDownloadSelected}
                  onClearFolder={clearFolder}
                  onRetryFailed={retryFailed}
                  onToggleFileSelection={toggleFileSelection}
                  onSelectAll={selectAllInFolder}
                  disabled={isConverting}
                />
              ))}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-8 animate-in fade-in duration-700 delay-500">
          <FAQSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
