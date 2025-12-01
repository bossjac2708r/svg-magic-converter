import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export const FAQSection = () => {
  return (
    <Card className="p-6 shadow-soft border-border">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left">What is SVG?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            SVG (Scalable Vector Graphics) is a vector image format that uses mathematical
            descriptions rather than pixels. Unlike JPG or PNG, SVG images can be scaled to any
            size without losing quality, making them perfect for logos, icons, and graphics that
            need to look sharp at any resolution.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left">What is image tracing?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Image tracing (or vectorization) is the process of converting a raster image (like JPG
            or PNG made of pixels) into a vector image (SVG made of paths). Our tool uses
            sophisticated algorithms to detect edges and shapes in your image and recreate them as
            smooth vector paths.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left">What is posterization?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Posterization reduces the number of colors in an image to create a stylized effect.
            Our posterize mode converts your image to 4 grayscale levels, creating layered SVG
            paths that preserve more detail than basic black and white conversion while still
            maintaining a clean, vector look.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-left">
            Are my files safe and private?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Absolutely! We take privacy seriously. All uploaded files and converted SVGs are
            automatically deleted from our servers after 60 minutes. We don't store, analyze, or
            share your files with anyone. No watermarks are added to your images.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-left">
            What file formats are supported?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            We currently support JPG and PNG image formats as input. You can upload up to 50 files
            at once, with a maximum file size of 20MB per image. All conversions output as
            optimized SVG files.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger className="text-left">
            Which mode should I choose?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Choose <strong>Black & White</strong> mode for simple graphics, logos, and icons where you
            want a clean two-color result. Choose <strong>Posterize (4 colors)</strong> mode for photos
            or complex images where you want to preserve more detail and tonal variation. The
            posterize mode creates a more nuanced SVG with multiple grayscale layers.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger className="text-left">
            Do I need to create an account?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            No! SVG Magic Converter is completely free and requires no registration or account.
            Simply upload your files, choose your conversion mode, and download your SVGs. It's
            that simple.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger className="text-left">
            Can I use the converted SVGs commercially?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Yes! The SVG files you create using our converter are yours to use however you like,
            including for commercial projects. We don't add watermarks or claim any rights to your
            converted files. However, make sure you have the rights to the original images you're
            converting.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
