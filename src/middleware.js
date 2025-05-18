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

// If you need a middleware, ensure it's compatible with Astro's Cloudflare adapter.
// For now, we'll let the adapter handle everything.
export async function onRequest({ request, platform, context }, next) {
  const url = new URL(request.url);
  console.log(`[ASTRO-MIDDLEWARE-LOG] Request received for: ${url.pathname}${url.search}`);

  const isPotentialAsset =
    url.pathname.startsWith('/_astro/') ||
    url.pathname.startsWith('/logo.png') ||
    url.pathname.startsWith('/pwa-192x192.png') ||
    url.pathname.startsWith('/pwa-512x512.png') ||
    url.pathname.startsWith('/favicon.svg') ||
    url.pathname.startsWith('/manifest.json') || // Checking for .json
    url.pathname.startsWith('/manifest.webmanifest') || // Checking for .webmanifest
    url.pathname.startsWith('/app.') || // for CSS/JS chunks
    url.pathname.startsWith('/workbox-') || // for workbox files
    url.pathname.startsWith('/sw.js');

  if (isPotentialAsset) {
    console.log(`[ASTRO-MIDDLEWARE-LOG] Pathname ${url.pathname} matches potential asset patterns.`);
  }

  if (platform) {
    console.log('[ASTRO-MIDDLEWARE-LOG] Platform object detected.');
    if (platform.env) {
      console.log('[ASTRO-MIDDLEWARE-LOG] Cloudflare Worker platform.env bindings:', Object.keys(platform.env));
    }
    if (platform.context && typeof platform.context.waitUntil === 'function') {
      console.log('[ASTRO-MIDDLEWARE-LOG] Cloudflare Worker platform.context.waitUntil detected.');
    }
  } else if (context && context.platform) {
     console.log('[ASTRO-MIDDLEWARE-LOG] Platform object detected under context.');
    if (context.platform.env) {
      console.log('[ASTRO-MIDDLEWARE-LOG] Cloudflare Worker context.platform.env bindings:', Object.keys(context.platform.env));
    }
    // Astro might put cf on context directly, or context.cf
    if (context.cf) {
         console.log('[ASTRO-MIDDLEWARE-LOG] context.cf object detected:', Object.keys(context.cf));
    }
    if (context.platform && context.platform.context && typeof context.platform.context.waitUntil === 'function') {
      console.log('[ASTRO-MIDDLEWARE-LOG] Cloudflare Worker context.platform.context.waitUntil detected.');
    }
  }


  try {
    console.log(`[ASTRO-MIDDLEWARE-LOG] Calling next() for ${url.pathname}`);
    const response = await next();
    console.log(`[ASTRO-MIDDLEWARE-LOG] next() completed for ${url.pathname}, response status: ${response.status}`);
    
    if (isPotentialAsset && response.status !== 200) { // Log headers for non-200 asset responses
        const headersObj = {};
        response.headers.forEach((value, key) => { headersObj[key] = value; });
        console.log(`[ASTRO-MIDDLEWARE-LOG] Non-200 response headers for asset ${url.pathname} (Status: ${response.status}):`, JSON.stringify(headersObj));
    }
    return response;
  } catch (error) {
    // Using a more detailed error logging
    let errorDetails = {
        message: error.message,
        stack: error.stack,
    };
    if (error.cause) {
        errorDetails.cause = String(error.cause); // Convert cause to string if it's complex
    }
    console.error(`[ASTRO-MIDDLEWARE-LOG] Error during next() for ${url.pathname}:`, JSON.stringify(errorDetails, null, 2));
    
    // Re-throw to let Astro's adapter handle it, which should result in a 500 page
    // or allow Cloudflare to log the worker error.
    throw error;
  }
} 