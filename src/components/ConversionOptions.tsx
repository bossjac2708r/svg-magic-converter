import { Circle, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ConversionMode } from "@/pages/Index";

interface ConversionOptionsProps {
  mode: ConversionMode;
  onModeChange: (mode: ConversionMode) => void;
}

export const ConversionOptions = ({ mode, onModeChange }: ConversionOptionsProps) => {
  return (
    <Card className="p-6 shadow-soft border-border">
      <h2 className="text-2xl font-bold mb-4">Conversion Mode</h2>
      <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as ConversionMode)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            htmlFor="blackwhite"
            className={`
              flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${
                mode === "blackwhite"
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <RadioGroupItem value="blackwhite" id="blackwhite" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Circle className="h-5 w-5 text-primary" />
                <Label htmlFor="blackwhite" className="text-lg font-semibold cursor-pointer">
                  Black & White
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Classic Potrace conversion. Converts your image to a clean, two-color SVG
                (black and white). Perfect for logos, icons, and simple graphics.
              </p>
            </div>
          </label>

          <label
            htmlFor="posterize"
            className={`
              flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${
                mode === "posterize"
                  ? "border-primary bg-primary/5 shadow-soft"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <RadioGroupItem value="posterize" id="posterize" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-5 w-5 text-primary" />
                <Label htmlFor="posterize" className="text-lg font-semibold cursor-pointer">
                  Posterize (4 Colors)
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced conversion with 4 grayscale levels. Creates a layered SVG with more
                detail and depth. Ideal for photos and complex images.
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>
    </Card>
  );
};
