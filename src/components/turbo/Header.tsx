import { Zap, Folder } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-medium">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">SVG Turbo Converter</h1>
            <p className="text-xs text-muted-foreground">Offline • Lightning Fast</p>
          </div>
        </div>
      </div>
    </header>
  );
};
