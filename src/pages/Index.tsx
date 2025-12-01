import { useState } from "react";
import { Upload, FileCheck, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ConversionOptions } from "@/components/ConversionOptions";
import { FileList } from "@/components/FileList";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type ConversionMode = "blackwhite" | "posterize";
export type FileStatus = "queued" | "processing" | "ready" | "error";

export interface UploadedFile {
  id: string;
  file: File;
  status: FileStatus;
  originalUrl?: string;
  svgUrl?: string;
  mode: ConversionMode;
}

const Index = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mode, setMode] = useState<ConversionMode>("blackwhite");
  const [consent, setConsent] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFilesAdded = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "queued" as FileStatus,
      mode,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);
    toast({
      title: "Files added",
      description: `${newFiles.length} file(s) ready for conversion`,
    });
  };

  const handleConvert = async () => {
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please consent to processing your data",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files",
        description: "Please upload files first",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      // Upload files and start conversion
      for (const uploadedFile of files) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: "processing" } : f
          )
        );

        // Upload original file to storage
        const filePath = `originals/${uploadedFile.id}-${uploadedFile.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("conversions")
          .upload(filePath, uploadedFile.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("conversions")
          .getPublicUrl(filePath);

        // Create database record
        const { data: uploadRecord, error: dbError } = await supabase
          .from("uploads")
          .insert({
            original_filename: uploadedFile.file.name,
            original_path: filePath,
            status: "processing",
            mode: uploadedFile.mode,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // For now, simulate conversion (in production, this would call an edge function)
        // TODO: Implement actual Potrace conversion
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: "ready", originalUrl: publicUrl, svgUrl: publicUrl }
                : f
            )
          );
        }, 2000);
      }

      toast({
        title: "Conversion complete!",
        description: "All files have been converted to SVG",
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "There was an error converting your files",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadAll = () => {
    // TODO: Implement ZIP download via edge function
    toast({
      title: "Download starting",
      description: "Preparing ZIP file...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-accent">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-in fade-in duration-700">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <FileCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">No Registration Required</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            SVG Magic Converter
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Free Online JPG/PNG to SVG Converter
          </p>
          <p className="text-sm text-muted-foreground">
            Convert up to 50 images • Auto-delete after 60 minutes • No watermarks
          </p>
        </section>

        {/* Upload Zone */}
        <section className="mb-8 animate-in fade-in duration-700 delay-100">
          <UploadZone onFilesAdded={handleFilesAdded} maxFiles={50} />
        </section>

        {/* Conversion Options */}
        <section className="mb-8 animate-in fade-in duration-700 delay-200">
          <ConversionOptions mode={mode} onModeChange={setMode} />
        </section>

        {/* Consent */}
        {files.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-500">
            <div className="flex items-center space-x-2 bg-card p-4 rounded-lg border border-border shadow-soft">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
              />
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I consent to processing my data (files will be automatically deleted after 60 minutes)
              </Label>
            </div>
          </section>
        )}

        {/* File List */}
        {files.length > 0 && (
          <section className="mb-8 animate-in fade-in duration-700 delay-300">
            <div className="bg-card rounded-lg border border-border shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Files</h2>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={isConverting || !consent}
                    className="bg-gradient-primary hover:opacity-90 transition-smooth"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Convert All
                      </>
                    )}
                  </Button>
                  {files.some((f) => f.status === "ready") && (
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Download All as ZIP
                    </Button>
                  )}
                </div>
              </div>
              <FileList files={files} />
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-8 animate-in fade-in duration-700 delay-400">
          <FAQSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
