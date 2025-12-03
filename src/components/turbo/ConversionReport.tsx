import { CheckCircle2, XCircle, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GlobalStats } from "@/types/converter";

// Use GlobalStats instead of ConversionStats for consistency
type ConversionStats = GlobalStats;

interface ConversionReportProps {
  stats: ConversionStats;
  onClose: () => void;
}

export const ConversionReport = ({ stats, onClose }: ConversionReportProps) => {
  const { totalFiles, converted, failed, startTime, endTime, averageSpeed } = stats;
  
  const totalTime = startTime && endTime ? ((endTime - startTime) / 1000).toFixed(1) : "0";
  const successRate = totalFiles > 0 ? ((converted / totalFiles) * 100).toFixed(1) : "0";

  return (
    <Card className="p-6 bg-gradient-accent border-primary/20 shadow-elegant">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-primary mb-4">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Conversion Complete!</h3>
        <p className="text-muted-foreground">Here's your batch conversion report</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 border border-border text-center">
          <div className="text-3xl font-bold text-primary mb-1">{totalFiles}</div>
          <div className="text-sm text-muted-foreground">Total Files</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-success/50 text-center">
          <div className="text-3xl font-bold text-success mb-1">{converted}</div>
          <div className="text-sm text-muted-foreground">Converted</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-destructive/50 text-center">
          <div className="text-3xl font-bold text-destructive mb-1">{failed}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-primary/50 text-center">
          <div className="text-3xl font-bold text-primary mb-1">{successRate}%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Time</div>
            <div className="text-lg font-bold">{totalTime}s</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Average Speed</div>
            <div className="text-lg font-bold">{averageSpeed.toFixed(2)} img/s</div>
          </div>
        </div>
      </div>

      {failed > 0 && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/50 mb-6">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-destructive mb-1">Some conversions failed</div>
            <p className="text-sm text-muted-foreground">
              {failed} {failed === 1 ? "file" : "files"} couldn't be converted. This may be due to corrupted images, unsupported formats, or memory limitations.
            </p>
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full bg-gradient-primary hover:opacity-90">
        Close Report
      </Button>
    </Card>
  );
};
