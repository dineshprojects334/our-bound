export function shouldUseLocalGalleryFallback({ viteApiBase = '', isDev = false } = {}) {
  return Boolean(isDev) && !Boolean(viteApiBase);
}
