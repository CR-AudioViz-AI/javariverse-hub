/**
 * CR AudioViz AI - Central Stock Photos API
 * Aggregates Unsplash, Pexels, Pixabay, Giphy
 * 
 * @author CR AudioViz AI, LLC
 * @created December 31, 2025
 */

import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
const GIPHY_KEY = process.env.GIPHY_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all';
    const query = searchParams.get('query') || 'nature';
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    const results: any = { photos: [], source };

    if (source === 'unsplash' || source === 'all') {
      try {
        const res = await fetch(
          \`https://api.unsplash.com/search/photos?query=\${encodeURIComponent(query)}&page=\${page}&per_page=\${per_page}\`,
          { headers: { Authorization: \`Client-ID \${UNSPLASH_KEY}\` } }
        );
        const data = await res.json();
        const photos = data.results?.map((p: any) => ({
          id: p.id, url: p.urls.regular, thumb: p.urls.thumb,
          author: p.user.name, source: 'unsplash'
        })) || [];
        results.photos = [...results.photos, ...photos];
      } catch (e) { console.error('Unsplash error:', e); }
    }

    if (source === 'pexels' || source === 'all') {
      try {
        const res = await fetch(
          \`https://api.pexels.com/v1/search?query=\${encodeURIComponent(query)}&page=\${page}&per_page=\${per_page}\`,
          { headers: { Authorization: PEXELS_KEY! } }
        );
        const data = await res.json();
        const photos = data.photos?.map((p: any) => ({
          id: p.id, url: p.src.large, thumb: p.src.tiny,
          author: p.photographer, source: 'pexels'
        })) || [];
        results.photos = [...results.photos, ...photos];
      } catch (e) { console.error('Pexels error:', e); }
    }

    if (source === 'pixabay' || source === 'all') {
      try {
        const res = await fetch(
          \`https://pixabay.com/api/?key=\${PIXABAY_KEY}&q=\${encodeURIComponent(query)}&page=\${page}&per_page=\${per_page}\`
        );
        const data = await res.json();
        const photos = data.hits?.map((p: any) => ({
          id: p.id, url: p.largeImageURL, thumb: p.previewURL,
          author: p.user, source: 'pixabay'
        })) || [];
        results.photos = [...results.photos, ...photos];
      } catch (e) { console.error('Pixabay error:', e); }
    }

    if (source === 'giphy' || source === 'all') {
      try {
        const res = await fetch(
          \`https://api.giphy.com/v1/gifs/search?api_key=\${GIPHY_KEY}&q=\${encodeURIComponent(query)}&limit=\${per_page}&offset=\${(page-1)*per_page}\`
        );
        const data = await res.json();
        const gifs = data.data?.map((g: any) => ({
          id: g.id, url: g.images.original.url, thumb: g.images.fixed_height_small.url,
          author: g.username, source: 'giphy', type: 'gif'
        })) || [];
        results.photos = [...results.photos, ...gifs];
      } catch (e) { console.error('Giphy error:', e); }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
