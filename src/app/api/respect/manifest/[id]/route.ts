import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';
const APP_BASE_URL = 'https://kokeb.et/respect-minimal-games';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 1. Fetch Game Metadata to discover assets (Hierarchical fallback)
    const endpoints = [
      `${API_BASE_URL}/respect/gamesdata/${id}`,
      `${API_BASE_URL}/games/${id}`,
      `${API_BASE_URL}/activities/${id}`,
      `${API_BASE_URL}/respect/games/${id}`
    ];

    let game = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const json = await res.json();
          game = json.data || json;
          if (game && (game.id === id || game.guid === id)) break;
        }
      } catch (e) { /* continue */ }
    }

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // 2. Discover Assets from game_data
    const resources: any[] = [
      {
        href: `${APP_BASE_URL}/api/respect/manifest/${id}`,
        type: 'application/webpub+json'
      }
    ];

    // Add Web App Shell Assets (CRITICAL for offline white-screen fix)
    // We include the main entry points of the Next.js app
    const shellAssets = [
      '/',
      `/games/${id}`,
      '/manifest.json',
      '/logo.png',
      '/favicon.ico',
      '/sw.js'
    ];

    shellAssets.forEach(path => {
      resources.push({
        href: `${APP_BASE_URL}${path}`,
        type: path.endsWith('.js') ? 'application/javascript' : (path.endsWith('.json') ? 'application/json' : 'text/html')
      });
    });

    // Extract images and audio from game_data
    if (game.game_data) {
       const data = typeof game.game_data === 'string' ? JSON.parse(game.game_data) : game.game_data;
       
       const findUrls = (obj: any) => {
         if (!obj) return;
         if (typeof obj === 'string') {
           // Handle both absolute and relative URLs
           let url = obj;
           if (url.startsWith('/api/')) {
             url = `${API_BASE_URL.replace('/api', '')}${url}`;
           }

           if (url.startsWith('http')) {
             if (url.match(/\.(png|jpg|jpeg|gif|svg|mp3|wav|ogg|m4a|webp|json|js|wasm|data)$/i) || url.includes('storage/proxy')) {
               let type = 'application/octet-stream';
               if (url.match(/\.(mp3|wav|m4a|ogg)$/i)) type = 'audio/mpeg';
               else if (url.match(/\.(png|jpg|jpeg|webp|gif)$/i)) type = 'image/png';
               else if (url.endsWith('.js')) type = 'application/javascript';
               else if (url.endsWith('.json')) type = 'application/json';

               resources.push({ href: url, type });
             }
           }
         } else if (typeof obj === 'object') {
           Object.values(obj).forEach(findUrls);
         }
       };
       findUrls(data);
    }

    // Add thumbnail and images from metadata
    if (game.thumbnail_url) resources.push({ href: game.thumbnail_url, type: 'image/png' });
    if (game.image_url) resources.push({ href: game.image_url, type: 'image/png' });
    if (game.video_url) resources.push({ href: game.video_url, type: 'video/mp4' });

    // 3. Build the RESPECT/Readium Manifest
    const manifest = {
      "@context": "https://readium.org/webpub-manifest/context.jsonld",
      "metadata": {
        "title": game.title,
        "identifier": `${APP_BASE_URL}/games/${id}`,
        "type": "http://schema.org/EducationalActivity",
        "author": "Learning Cloud",
        "language": "am-ET",
        "modified": new Date().toISOString()
      },
      "links": [
        {
          "rel": "self",
          "href": `${APP_BASE_URL}/api/respect/manifest/${id}`,
          "type": "application/webpub+json"
        }
      ],
      "readingOrder": [
        {
          "href": `${APP_BASE_URL}/games/${id}`,
          "type": "text/html",
          "title": "Start Game"
        }
      ],
      // Remove duplicates and ensure URLs are valid
      "resources": Array.from(new Set(resources.map(r => r.href)))
        .map(href => resources.find(r => r.href === href))
        .filter(r => r.href && !r.href.includes('null'))
    };

    return new NextResponse(JSON.stringify(manifest, null, 2), {
      headers: {
        'Content-Type': 'application/webpub+json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });


  } catch (error) {
    console.error('Manifest Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
