import { CheckCircle2, XCircle, Clock, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GlobalStats } from "@/types/converter";

interface FinalReportProps {
  stats: GlobalStats;
  onClose: () => void;
}

export const FinalReport = ({ stats, onClose }: FinalReportProps) => {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/20 rounded-xl border border-primary/30 p-6 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-6 w-6 text-success" />
        Conversion Complete
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success">{stats.converted}</div>
          <div className="text-sm text-muted-foreground">Converted</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-destructive">{stats.failed}</div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
        
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {stats.timeTaken ? formatTime(stats.timeTaken) : "-"}
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Time Taken
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {stats.averageSpeed.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" />
            img/sec
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Files will be automatically cleared from memory after download for privacy.
      </p>
    </div>
  );
};
