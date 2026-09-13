// Utility for reading and automatically optimizing/compressing file uploads
// to fit safely within Cloud Firestore's 1MB per-document limit.

export const MAX_NON_IMAGE_BYTES = 800 * 1024; // 800 KB for raw PDFs/documents

/**
 * Resizes and compresses an image file using an HTML5 Canvas so high-res phone photos
 * (2MB - 15MB) are automatically converted into lightweight, crisp web images (< 500KB).
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.82
): Promise<{ dataUrl: string; name: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio downscaling
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Unable to create canvas context"));
        }

        // Draw and compress to JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const estimatedSize = Math.round((dataUrl.length * 3) / 4);

        // Retain original name but ensure .jpg extension if converted
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const newName = `${baseName}.jpg`;

        resolve({
          dataUrl,
          name: file.type === "image/png" || file.type === "image/jpeg" ? file.name : newName,
          size: estimatedSize,
        });
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Reads a generic file as Data URL with validation and automatic image compression.
 */
export async function processFileUpload(
  file: File
): Promise<{ name: string; dataUrl: string }> {
  // If it's an image, automatically downscale and compress it
  if (file.type.startsWith("image/")) {
    try {
      const compressed = await compressImage(file);
      return {
        name: file.name,
        dataUrl: compressed.dataUrl,
      };
    } catch {
      // Fallback to normal reading if canvas fails
    }
  }

  // For non-images (PDFs, docs, text files)
  if (file.size > MAX_NON_IMAGE_BYTES) {
    throw new Error(
      `Non-image files (PDF/Docs) must be under 800KB due to database document limits (your file: ${(
        file.size / 1024
      ).toFixed(0)}KB).`
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, dataUrl: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Opens a base64 "data:" URL (e.g. an attached photo) in a new browser tab.
 *
 * Chrome and most Chromium browsers block top-level navigation of a new tab
 * directly to a data: URL for security reasons - window.open(dataUrl, "_blank")
 * silently results in a blank about:blank tab. To work around this, we convert
 * the data URL into a Blob and open a blob: URL instead, which browsers allow.
 */
export async function openDataUrlInNewTab(dataUrl: string | undefined | null): Promise<void> {
  if (!dataUrl) return;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, "_blank");
    // Revoke the blob URL once the new tab has had a chance to load it.
    if (win) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } else {
      URL.revokeObjectURL(blobUrl);
    }
  } catch {
    // Fallback: if the blob conversion fails for any reason, still attempt
    // the direct approach rather than doing nothing.
    window.open(dataUrl, "_blank");
  }
}
