import { Circle, Layers, Sliders } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import type { ConversionMode, ConversionSettings } from "@/types/converter";

interface ConversionOptionsProps {
  mode: ConversionMode;
  onModeChange: (mode: ConversionMode) => void;
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

export const ConversionOptions = ({ mode, onModeChange, settings, onSettingsChange }: ConversionOptionsProps) => {
  return (
    <Card className="p-6 shadow-soft border-border bg-card">
      <h2 className="text-2xl font-bold mb-6">Conversion Settings</h2>
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
                Classic 2-color tracing. Ultra-fast conversion for logos, icons, and simple graphics.
                Perfect for crisp, clean SVG output.
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
                Advanced 4-color layered SVG. Preserves more detail and depth for photos and
                complex images. Slightly slower but richer output.
              </p>
            </div>
          </label>
        </div>
      </RadioGroup>

      {/* Advanced Settings */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
        </div>
        
        <div className="space-y-6">
          {/* Smoothness Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Smoothness</Label>
              <span className="text-sm text-muted-foreground">{settings.smoothness.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.smoothness]}
              onValueChange={([value]) => onSettingsChange({ ...settings, smoothness: value })}
              min={0.1}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Higher values create smoother curves with fewer points
            </p>
          </div>

          {/* Noise Reduction Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Noise Reduction</Label>
              <span className="text-sm text-muted-foreground">{settings.noiseReduction.toFixed(1)}</span>
            </div>
            <Slider
              value={[settings.noiseReduction]}
              onValueChange={([value]) => onSettingsChange({ ...settings, noiseReduction: value })}
              min={0}
              max={3}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Reduces small artifacts and improves trace quality
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
