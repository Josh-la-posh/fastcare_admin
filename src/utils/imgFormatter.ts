export function normalizeImageSrc(src?: string | null): string | null {
  if (!src) return null;

  // Already a full URL or data URL
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }

  // Probably a bare base64 string – wrap it as a data URL
  return `data:image/jpeg;base64,${src}`;
}
