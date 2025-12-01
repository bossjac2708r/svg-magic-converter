import { Clock, Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Files deleted automatically after 60 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>No watermarks • Privacy first</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Copyright © 2025 SVG Magic Converter
          </div>
        </div>
      </div>
    </footer>
  );
};
