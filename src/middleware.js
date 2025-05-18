export async function onRequest({ request }, next) {
  const url = new URL(request.url);

  // Serve static assets from /public
  if (
    url.pathname.startsWith('/logo.png') ||
    url.pathname.startsWith('/pwa-192x192.png') ||
    url.pathname.startsWith('/pwa-512x512.png') ||
    url.pathname.startsWith('/favicon.svg') ||
    url.pathname.startsWith('/manifest.json')
  ) {
    // Try to fetch the asset from the deployed worker's public folder
    // The asset will be available at ./public/<filename> in the worker bundle
    const assetPath = './public' + url.pathname;
    try {
      const mod = await import(assetPath);
      return new Response(mod.default, {
        headers: { 'content-type': getContentType(url.pathname) }
      });
    } catch (e) {
      // Not found, continue to SSR
    }
  }

  // Fallback to SSR
  return next();
}

function getContentType(path) {
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
} 