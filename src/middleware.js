// const staticAssets = import.meta.glob('../dist/**/*', { as: 'raw' });

// export async function onRequest({ request }, next) {
//   const url = new URL(request.url);

//   // Only handle static assets (/_astro, /public, etc.)
//   if (
//     url.pathname.startsWith('/_astro/') ||
//     url.pathname.startsWith('/logo.png') ||
//     url.pathname.startsWith('/pwa-192x192.png') ||
//     url.pathname.startsWith('/pwa-512x512.png') ||
//     url.pathname.startsWith('/favicon.svg') ||
//     url.pathname.startsWith('/manifest.json') ||
//     url.pathname.startsWith('/manifest.webmanifest') ||
//     url.pathname.startsWith('/app.') || // for CSS/JS chunks
//     url.pathname.startsWith('/workbox-') || // for workbox files
//     url.pathname.startsWith('/sw.js')
//   ) {
//     // Map URL path to file path in dist output
//     let assetPath = '../dist' + url.pathname;
//     const mod = staticAssets[assetPath];
//     if (mod) {
//       const content = await mod();
//       return new Response(content, {
//         headers: { 'content-type': getContentType(url.pathname) }
//       });
//     }
//     // Not found, continue to SSR
//   }

//   // Fallback to SSR
//   return next();
// }

// function getContentType(path) {
//   if (path.endsWith('.png')) return 'image/png';
//   if (path.endsWith('.svg')) return 'image/svg+xml';
//   if (path.endsWith('.json') || path.endsWith('.webmanifest')) return 'application/json';
//   if (path.endsWith('.js')) return 'application/javascript';
//   if (path.endsWith('.css')) return 'text/css';
//   return 'application/octet-stream';
// }

// If you need a middleware, ensure it's compatible with the Vercel adapter.
// For now, we'll let the adapter handle everything or use a minimal setup.
export async function onRequest(context, next) {
  // Minimal middleware: just proceed to the next handler.
  // You can add Astro locals or other Vercel-specific logic here if needed in the future.
  const response = await next();
  return response;
}

// All other logging and functions should be removed or commented out. 