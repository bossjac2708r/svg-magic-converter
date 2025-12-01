import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export const FAQSection = () => {
  return (
    <Card className="p-6 shadow-soft border-border bg-card">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-left">
            How is this different from other converters?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            SVG Turbo Converter processes everything locally in your browser using WebAssembly.
            Your images never leave your device - no uploads, no servers, no privacy concerns.
            Plus, we use Web Workers for parallel processing, making conversions blazing fast even
            with large batches.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-left">What is SVG?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            SVG (Scalable Vector Graphics) is a vector image format that can scale to any size
            without losing quality. Unlike pixel-based formats like JPG or PNG, SVGs use
            mathematical paths, making them perfect for logos, icons, and graphics that need to
            look sharp at any resolution.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-left">
            What happens to my images?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Nothing! Your images are processed entirely in your browser's memory and never leave
            your device. We don't upload anything to any server. Once you close the page or
            refresh, all data is cleared from memory. This ensures complete privacy and security.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-left">
            Which mode should I choose?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Choose <strong>Black & White</strong> for simple graphics, logos, and icons where you
            want a clean 2-color result. It's the fastest option. Choose{" "}
            <strong>Posterize (4 colors)</strong> for photos or complex images where you want to
            preserve more tonal detail. It takes slightly longer but produces richer SVGs.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-left">
            How fast is the conversion?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Very fast! We use Web Workers to process up to 4 images simultaneously. A typical image
            converts in 1-3 seconds depending on complexity and your device's processing power.
            Black & white mode is faster than posterize mode.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger className="text-left">
            What file formats are supported?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            We support JPG and PNG formats as input. You can upload up to 200 files at once, with
            a maximum file size of 50MB per image. All conversions output as optimized SVG files.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger className="text-left">
            Can I use the SVGs commercially?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Yes! The SVG files you create are yours to use however you like, including for
            commercial projects. We don't add watermarks or claim any rights to your files. Just
            make sure you have the rights to the original images you're converting.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger className="text-left">
            Does this work offline?
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            Yes! Once the page loads, all conversion happens in your browser. You can disconnect
            from the internet and continue converting images. The initial page load requires
            internet to download the conversion library, but after that, it's fully offline
            capable.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
