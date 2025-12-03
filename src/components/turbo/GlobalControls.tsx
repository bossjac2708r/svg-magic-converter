import { Play, Pause, Square, Download, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ConversionSettings, GlobalStats } from "@/types/converter";

interface GlobalControlsProps {
  stats: GlobalStats;
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  isConverting: boolean;
  isPaused: boolean;
  canStart: boolean;
  onStartAll: () => void;
  onPauseResume: () => void;
  onCancel: () => void;
  onDownloadAllFolders: () => void;
  readyCount: number;
}

export const GlobalControls = ({
  stats,
  settings,
  onSettingsChange,
  isConverting,
  isPaused,
  canStart,
  onStartAll,
  onPauseResume,
  onCancel,
  onDownloadAllFolders,
  readyCount,
}: GlobalControlsProps) => {
  const progress = stats.totalFiles > 0 
    ? ((stats.converted + stats.failed) / stats.totalFiles) * 100 
    : 0;

  return (
    <div className="bg-card rounded-xl border border-border shadow-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold">Batch Processing</h2>
          <p className="text-sm text-muted-foreground">
            {stats.totalFiles} total files across {stats.totalFolders} folders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conversion Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Concurrency (Workers)</Label>
                    <span className="text-sm text-muted-foreground">{settings.concurrency}</span>
                  </div>
                  <Slider
                    value={[settings.concurrency]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, concurrency: value })}
                    min={1}
                    max={8}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">More workers = faster but uses more CPU</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Smoothness</Label>
                    <span className="text-sm text-muted-foreground">{settings.smoothness.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[settings.smoothness]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, smoothness: value })}
                    min={0.1}
                    max={2}
                    step={0.1}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Noise Reduction</Label>
                    <span className="text-sm text-muted-foreground">{settings.noiseReduction.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[settings.noiseReduction]}
                    onValueChange={([value]) => onSettingsChange({ ...settings, noiseReduction: value })}
                    min={0}
                    max={3}
                    step={0.5}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Downscale Large Images</Label>
                    <p className="text-xs text-muted-foreground">Faster processing for big images</p>
                  </div>
                  <Switch
                    checked={settings.downscaleEnabled}
                    onCheckedChange={(checked) => onSettingsChange({ ...settings, downscaleEnabled: checked })}
                  />
                </div>
                
                {settings.downscaleEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Max Width (px)</Label>
                      <span className="text-sm text-muted-foreground">{settings.downscaleMaxWidth}</span>
                    </div>
                    <Slider
                      value={[settings.downscaleMaxWidth]}
                      onValueChange={([value]) => onSettingsChange({ ...settings, downscaleMaxWidth: value })}
                      min={512}
                      max={4096}
                      step={128}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Progress bar */}
      {(isConverting || stats.converted > 0) && (
        <div className="mb-4">
          <Progress value={progress} className="h-3 mb-2" />
          <div className="flex flex-wrap items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {stats.converted} converted, {stats.failed} failed
            </span>
            {stats.averageSpeed > 0 && (
              <span className="font-medium text-primary">
                {stats.averageSpeed.toFixed(2)} img/s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {!isConverting ? (
          <Button
            onClick={onStartAll}
            disabled={!canStart}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Play className="h-4 w-4 mr-2" />
            Start All
          </Button>
        ) : (
          <>
            <Button
              onClick={onPauseResume}
              variant="outline"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        )}
        
        {readyCount > 0 && (
          <Button
            onClick={onDownloadAllFolders}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All ({readyCount} files)
          </Button>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs">Space</kbd> Start/Pause • 
          <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs ml-1">Esc</kbd> Cancel • 
          <kbd className="px-1.5 py-0.5 bg-accent rounded text-xs ml-1">D</kbd> Download All
        </p>
      </div>
    </div>
  );
};
