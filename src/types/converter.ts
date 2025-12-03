export type ConversionMode = "blackwhite" | "posterize";
export type FileStatus = "queued" | "processing" | "ready" | "error";
export type FolderStatus = "idle" | "converting" | "paused" | "completed";

export interface ConversionSettings {
  smoothness: number;
  noiseReduction: number;
  concurrency: number;
  downscaleEnabled: boolean;
  downscaleMaxWidth: number;
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
  path?: string;
  conversionTime?: number;
  selected?: boolean;
}

export interface FolderData {
  id: string;
  name: string;
  files: UploadedFile[];
  status: FolderStatus;
  stats: FolderStats;
}

export interface FolderStats {
  totalFiles: number;
  converted: number;
  failed: number;
  startTime: number | null;
  currentSpeed: number;
  eta: number | null;
}

export interface GlobalStats {
  totalFolders: number;
  totalFiles: number;
  converted: number;
  failed: number;
  startTime: number | null;
  endTime: number | null;
  averageSpeed: number;
  timeTaken: number | null;
}

export const DEFAULT_SETTINGS: ConversionSettings = {
  smoothness: 1,
  noiseReduction: 1,
  concurrency: 4,
  downscaleEnabled: false,
  downscaleMaxWidth: 1920,
};

export const MAX_FOLDERS = 3;
export const MAX_FILES_PER_FOLDER = 120;
export const MAX_TOTAL_FILES = 360;
