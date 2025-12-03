import { useState, useCallback, useRef } from "react";
import { loadImageFromFile, imageToImageData } from "@/lib/imageTracer";
import type {
  FolderData,
  UploadedFile,
  ConversionSettings,
  ConversionMode,
  GlobalStats,
} from "@/types/converter";

interface UseConversionEngineProps {
  settings: ConversionSettings;
  mode: ConversionMode;
}

export const useConversionEngine = ({ settings, mode }: UseConversionEngineProps) => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalFolders: 0,
    totalFiles: 0,
    converted: 0,
    failed: 0,
    startTime: null,
    endTime: null,
    averageSpeed: 0,
    timeTaken: null,
  });

  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);
  const workersRef = useRef<Worker[]>([]);

  const downscaleImage = (img: HTMLImageElement, maxWidth: number): ImageData => {
    const canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    ctx.drawImage(img, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  };

  const convertFile = async (file: UploadedFile, folderId: string): Promise<void> => {
    const startTime = Date.now();

    try {
      // Update status to processing
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? {
                ...f,
                files: f.files.map((fl) =>
                  fl.id === file.id ? { ...fl, status: "processing" as const } : fl
                ),
              }
            : f
        )
      );

      // Load and optionally downscale image
      const img = await loadImageFromFile(file.file);
      const imageData = settings.downscaleEnabled && img.width > settings.downscaleMaxWidth
        ? downscaleImage(img, settings.downscaleMaxWidth)
        : imageToImageData(img);

      // Create worker for conversion
      const worker = new Worker(
        new URL("../lib/conversionWorker.ts", import.meta.url),
        { type: "module" }
      );
      workersRef.current.push(worker);

      return new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          if (e.data.type === "success") {
            const svgBlob = new Blob([e.data.svgString], { type: "image/svg+xml" });
            const conversionTime = Date.now() - startTime;

            // Release original image from memory immediately
            URL.revokeObjectURL(file.originalUrl);

            setFolders((prev) =>
              prev.map((f) =>
                f.id === folderId
                  ? {
                      ...f,
                      files: f.files.map((fl) =>
                        fl.id === file.id
                          ? {
                              ...fl,
                              status: "ready" as const,
                              svgString: e.data.svgString,
                              svgBlob,
                              conversionTime,
                              originalUrl: "", // Clear to free memory
                            }
                          : fl
                      ),
                      stats: {
                        ...f.stats,
                        converted: f.stats.converted + 1,
                      },
                    }
                  : f
              )
            );

            worker.terminate();
            workersRef.current = workersRef.current.filter((w) => w !== worker);
            resolve();
          } else if (e.data.type === "error") {
            setFolders((prev) =>
              prev.map((f) =>
                f.id === folderId
                  ? {
                      ...f,
                      files: f.files.map((fl) =>
                        fl.id === file.id
                          ? { ...fl, status: "error" as const, error: e.data.error }
                          : fl
                      ),
                      stats: {
                        ...f.stats,
                        failed: f.stats.failed + 1,
                      },
                    }
                  : f
              )
            );
            worker.terminate();
            workersRef.current = workersRef.current.filter((w) => w !== worker);
            reject(new Error(e.data.error));
          }
        };

        worker.onerror = (error) => {
          setFolders((prev) =>
            prev.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    files: f.files.map((fl) =>
                      fl.id === file.id
                        ? { ...fl, status: "error" as const, error: error.message }
                        : fl
                    ),
                    stats: {
                      ...f.stats,
                      failed: f.stats.failed + 1,
                    },
                  }
                : f
            )
          );
          worker.terminate();
          workersRef.current = workersRef.current.filter((w) => w !== worker);
          reject(error);
        };

        worker.postMessage({
          type: "convert",
          imageData,
          mode: file.mode,
          settings: {
            smoothness: settings.smoothness,
            noiseReduction: settings.noiseReduction,
          },
          fileId: file.id,
          fileName: file.file.name,
        });
      });
    } catch (error) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId
            ? {
                ...f,
                files: f.files.map((fl) =>
                  fl.id === file.id
                    ? {
                        ...fl,
                        status: "error" as const,
                        error: error instanceof Error ? error.message : "Unknown error",
                      }
                    : fl
                ),
                stats: {
                  ...f.stats,
                  failed: f.stats.failed + 1,
                },
              }
            : f
        )
      );
      throw error;
    }
  };

  const processFolderBatch = async (
    folder: FolderData,
    concurrency: number
  ): Promise<void> => {
    const queuedFiles = folder.files.filter((f) => f.status === "queued");
    const startTime = Date.now();

    setFolders((prev) =>
      prev.map((f) =>
        f.id === folder.id
          ? {
              ...f,
              status: "converting",
              stats: { ...f.stats, startTime, totalFiles: queuedFiles.length },
            }
          : f
      )
    );

    for (let i = 0; i < queuedFiles.length; i += concurrency) {
      // Check for pause/cancel
      while (pausedRef.current && !cancelledRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (cancelledRef.current) break;

      const batch = queuedFiles.slice(i, i + concurrency);
      await Promise.allSettled(batch.map((file) => convertFile(file, folder.id)));

      // Update folder stats with speed and ETA
      const elapsed = (Date.now() - startTime) / 1000;
      const converted = folder.files.filter((f) => f.status === "ready").length;
      const remaining = queuedFiles.length - (i + batch.length);
      const currentSpeed = converted / elapsed;
      const eta = currentSpeed > 0 ? Math.ceil(remaining / currentSpeed) : null;

      setFolders((prev) =>
        prev.map((f) =>
          f.id === folder.id
            ? {
                ...f,
                stats: { ...f.stats, currentSpeed, eta },
              }
            : f
        )
      );
    }

    setFolders((prev) =>
      prev.map((f) =>
        f.id === folder.id ? { ...f, status: "completed" } : f
      )
    );
  };

  const startAllConversions = useCallback(async () => {
    setIsConverting(true);
    setIsPaused(false);
    pausedRef.current = false;
    cancelledRef.current = false;

    const startTime = Date.now();
    const totalFiles = folders.reduce((acc, f) => acc + f.files.filter((fl) => fl.status === "queued").length, 0);

    setGlobalStats({
      totalFolders: folders.length,
      totalFiles,
      converted: 0,
      failed: 0,
      startTime,
      endTime: null,
      averageSpeed: 0,
      timeTaken: null,
    });

    // Process all folders in parallel
    await Promise.allSettled(
      folders.map((folder) => processFolderBatch(folder, settings.concurrency))
    );

    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    // Calculate final stats
    setFolders((current) => {
      const converted = current.reduce((acc, f) => acc + f.files.filter((fl) => fl.status === "ready").length, 0);
      const failed = current.reduce((acc, f) => acc + f.files.filter((fl) => fl.status === "error").length, 0);

      setGlobalStats({
        totalFolders: current.length,
        totalFiles,
        converted,
        failed,
        startTime,
        endTime,
        averageSpeed: converted / (timeTaken / 1000),
        timeTaken,
      });

      return current;
    });

    setIsConverting(false);
  }, [folders, settings.concurrency]);

  const pauseResume = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    
    setFolders((prev) =>
      prev.map((f) =>
        f.status === "converting"
          ? { ...f, status: pausedRef.current ? "paused" : "converting" }
          : f
      )
    );
  }, []);

  const cancelConversion = useCallback(() => {
    cancelledRef.current = true;
    pausedRef.current = false;
    
    // Terminate all workers
    workersRef.current.forEach((w) => w.terminate());
    workersRef.current = [];
    
    setIsConverting(false);
    setIsPaused(false);
    
    setFolders((prev) =>
      prev.map((f) => ({
        ...f,
        status: "idle",
        files: f.files.map((fl) =>
          fl.status === "processing" ? { ...fl, status: "queued" } : fl
        ),
      }))
    );
  }, []);

  const addFolder = useCallback((folderIndex: number, files: File[], folderName: string) => {
    const uploadedFiles: UploadedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "queued" as const,
      originalUrl: URL.createObjectURL(file),
      mode,
      selected: false,
    }));

    const newFolder: FolderData = {
      id: crypto.randomUUID(),
      name: folderName,
      files: uploadedFiles,
      status: "idle",
      stats: {
        totalFiles: uploadedFiles.length,
        converted: 0,
        failed: 0,
        startTime: null,
        currentSpeed: 0,
        eta: null,
      },
    };

    setFolders((prev) => {
      const updated = [...prev];
      updated[folderIndex] = newFolder;
      return updated.filter(Boolean);
    });
  }, [mode]);

  const clearFolder = useCallback((folderId: string) => {
    setFolders((prev) => {
      const folder = prev.find((f) => f.id === folderId);
      if (folder) {
        folder.files.forEach((f) => {
          if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
        });
      }
      return prev.filter((f) => f.id !== folderId);
    });
  }, []);

  const clearFolderByIndex = useCallback((index: number) => {
    setFolders((prev) => {
      const folder = prev[index];
      if (folder) {
        folder.files.forEach((f) => {
          if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const retryFailed = useCallback((folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              files: f.files.map((fl) =>
                fl.status === "error" ? { ...fl, status: "queued" as const, error: undefined } : fl
              ),
              stats: { ...f.stats, failed: 0 },
            }
          : f
      )
    );
  }, []);

  const toggleFileSelection = useCallback((folderId: string, fileId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              files: f.files.map((fl) =>
                fl.id === fileId ? { ...fl, selected: !fl.selected } : fl
              ),
            }
          : f
      )
    );
  }, []);

  const selectAllInFolder = useCallback((folderId: string, selected: boolean) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? {
              ...f,
              files: f.files.map((fl) =>
                fl.status === "ready" ? { ...fl, selected } : fl
              ),
            }
          : f
      )
    );
  }, []);

  const clearAllAfterDownload = useCallback(() => {
    folders.forEach((folder) => {
      folder.files.forEach((f) => {
        if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      });
    });
    setFolders([]);
    setGlobalStats({
      totalFolders: 0,
      totalFiles: 0,
      converted: 0,
      failed: 0,
      startTime: null,
      endTime: null,
      averageSpeed: 0,
      timeTaken: null,
    });
  }, [folders]);

  return {
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
  };
};
