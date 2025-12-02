import { traceImage } from "./imageTracer";

interface ConversionSettings {
  smoothness: number;
  noiseReduction: number;
}

interface WorkerMessage {
  type: "convert";
  imageData: ImageData;
  mode: "blackwhite" | "posterize";
  settings: ConversionSettings;
  fileId: string;
  fileName: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, mode, settings, fileId, fileName } = e.data;

  if (type === "convert") {
    try {
      const svgString = await traceImage(imageData, { mode, settings });
      
      self.postMessage({
        type: "success",
        fileId,
        fileName,
        svgString,
      });
    } catch (error) {
      self.postMessage({
        type: "error",
        fileId,
        fileName,
        error: error instanceof Error ? error.message : "Conversion failed",
      });
    }
  }
};
