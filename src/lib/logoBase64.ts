let cachedLogoBase64: string | null = null;

export async function logoToBase64(): Promise<string> {
  if (cachedLogoBase64) {
    return cachedLogoBase64;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      cachedLogoBase64 = dataUrl;
      resolve(dataUrl);
    };
    img.onerror = () => {
      reject(new Error("Failed to load logo image"));
    };
    img.src = "/roventis-logo.png";
  });
}