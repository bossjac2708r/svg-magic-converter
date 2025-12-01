// @ts-ignore - imagetracerjs doesn't have TypeScript definitions
import ImageTracer from "imagetracerjs";

export interface TracingOptions {
  mode: "blackwhite" | "posterize";
}

export const traceImage = async (
  imageData: ImageData,
  options: TracingOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const tracingParams = options.mode === "blackwhite" 
        ? {
            ltres: 0.5,
            qtres: 1,
            pathomit: 8,
            colorsampling: 0,
            numberofcolors: 2,
            mincolorratio: 0,
            colorquantcycles: 3,
            blurradius: 0,
            blurdelta: 20,
          }
        : {
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            colorsampling: 0,
            numberofcolors: 4,
            mincolorratio: 0,
            colorquantcycles: 3,
            blurradius: 1,
            blurdelta: 20,
          };

      const svgString = ImageTracer.imagedataToSVG(imageData, tracingParams);
      resolve(svgString);
    } catch (error) {
      reject(error);
    }
  });
};

export const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    
    img.src = url;
  });
};

export const imageToImageData = (img: HTMLImageElement): ImageData => {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};
