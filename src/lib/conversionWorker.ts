import { traceImage } from "./imageTracer";

interface WorkerMessage {
  type: "convert";
  imageData: ImageData;
  mode: "blackwhite" | "posterize";
  fileId: string;
  fileName: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, imageData, mode, fileId, fileName } = e.data;

  if (type === "convert") {
    try {
      const svgString = await traceImage(imageData, { mode });
      
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
