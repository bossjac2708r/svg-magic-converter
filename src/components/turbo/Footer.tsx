import { Shield, Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/80 backdrop-blur-md mt-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>All conversions processed locally</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Nothing is uploaded • Zero tracking</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Copyright © 2025 SVG Turbo Converter
          </div>
        </div>
      </div>
    </footer>
  );
};
