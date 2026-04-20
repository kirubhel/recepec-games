import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';
const APP_BASE_URL = 'https://kokeb.et/respect-minimal-games';

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all games from the backend
    const res = await fetch(`${API_BASE_URL}/respect/games`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch games from API');
    }

    const json = await res.json();
    const games = json.data || [];

    // 2. Build the OPDS Feed
    const opds = {
      "metadata": {
        "title": "kokeb fidel Educational Games",
        "modified": new Date().toISOString()
      },
      "links": [
        {
          "rel": "self",
          "href": `${APP_BASE_URL}/api/respect/opds`,
          "type": "application/json"
        }
      ],
      "publications": games.map((game: any) => ({
        "metadata": {
          "identifier": `${APP_BASE_URL}/units/${game.id}`,
          "title": game.title,
          "description": game.description || "Educational game",
          "author": "Learning Cloud",
          "language": "am"
        },
        "links": [
          {
            "rel": "self",
            "href": `${APP_BASE_URL}/api/respect/manifest/${game.id}`,
            "type": "application/webpub+json"
          },
          {
            "rel": "http://opds-spec.org/acquisition",
            "href": `${APP_BASE_URL}/api/respect/manifest/${game.id}`,
            "type": "application/webpub+json"
          }
        ],
        "images": [
          {
            "href": game.thumbnail_url || `${APP_BASE_URL}/logo.png`,
            "type": "image/png"
          }
        ]
      }))
    };

    return new NextResponse(JSON.stringify(opds, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('OPDS Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
