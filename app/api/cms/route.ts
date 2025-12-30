// /api/cms/route.ts
// CMS & Knowledge Base API - CR AudioViz AI
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kteobfyferrukqeolofj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET: Fetch CMS content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'pages', 'posts', 'articles', 'faqs', 'media', 'collections', 'menus'
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const module = searchParams.get('module');
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    switch (type) {
      // ==================== PAGES ====================
      case 'pages': {
        if (id || slug) {
          const { data, error } = await supabase
            .from('cms_pages')
            .select('*')
            .eq(id ? 'id' : 'slug', id || slug)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
          }
          return NextResponse.json({ page: data });
        }

        let query = supabase
          .from('cms_pages')
          .select('*', { count: 'exact' })
          .eq('status', status)
          .order('sort_order', { ascending: true })
          .range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ pages: data, total: count });
      }

      // ==================== POSTS ====================
      case 'posts': {
        if (id || slug) {
          const { data, error } = await supabase
            .from('cms_posts')
            .select(`*, category:cms_categories(*)`)
            .eq(id ? 'id' : 'slug', id || slug)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
          }

          // Increment view count
          await supabase
            .from('cms_posts')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);

          return NextResponse.json({ post: data });
        }

        let query = supabase
          .from('cms_posts')
          .select(`*, category:cms_categories(id, name, slug)`, { count: 'exact' })
          .eq('status', status)
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (category) {
          query = query.eq('category_id', category);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data, error, count } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ posts: data, total: count });
      }

      // ==================== ARTICLES (Knowledge Base) ====================
      case 'articles': {
        if (id || slug) {
          let query = supabase
            .from('kb_articles')
            .select(`*, collection:kb_collections(*)`)
            .eq('status', 'published');

          if (id) {
            query = query.eq('id', id);
          } else if (slug && collection) {
            query = query.eq('slug', slug);
            // Would need to join on collection slug
          } else if (slug) {
            query = query.eq('slug', slug);
          }

          const { data, error } = await query.single();

          if (error) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
          }

          // Increment view count
          await supabase
            .from('kb_articles')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);

          return NextResponse.json({ article: data });
        }

        let query = supabase
          .from('kb_articles')
          .select(`*, collection:kb_collections(id, name, slug)`, { count: 'exact' })
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (collection) {
          query = query.eq('collection_id', collection);
        }

        if (search) {
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data, error, count } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ articles: data, total: count });
      }

      // ==================== COLLECTIONS ====================
      case 'collections': {
        if (id || slug) {
          const { data: collection, error } = await supabase
            .from('kb_collections')
            .select('*')
            .eq(id ? 'id' : 'slug', id || slug)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
          }

          // Get articles in collection
          const { data: articles } = await supabase
            .from('kb_articles')
            .select('id, title, slug, article_type, excerpt')
            .eq('collection_id', collection.id)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

          return NextResponse.json({ collection, articles: articles || [] });
        }

        const { data, error } = await supabase
          .from('kb_collections')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ collections: data });
      }

      // ==================== FAQs ====================
      case 'faqs': {
        let query = supabase
          .from('cms_faqs')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (category) {
          query = query.eq('category', category);
        }

        if (module) {
          query = query.eq('target_module', module);
        }

        if (search) {
          query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
        }

        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Group by category if requested
        const grouped = searchParams.get('grouped') === 'true';
        if (grouped && data) {
          const byCategory: Record<string, any[]> = {};
          data.forEach(faq => {
            const cat = faq.category || 'General';
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(faq);
          });
          return NextResponse.json({ faqs: data, grouped: byCategory, total: count });
        }

        return NextResponse.json({ faqs: data, total: count });
      }

      // ==================== MEDIA ====================
      case 'media': {
        if (id) {
          const { data, error } = await supabase
            .from('cms_media')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
          }
          return NextResponse.json({ media: data });
        }

        let query = supabase
          .from('cms_media')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const mediaType = searchParams.get('mediaType');
        if (mediaType) {
          query = query.eq('media_type', mediaType);
        }

        const folder = searchParams.get('folder');
        if (folder) {
          query = query.eq('folder', folder);
        }

        const { data, error, count } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ media: data, total: count });
      }

      // ==================== MENUS ====================
      case 'menus': {
        if (slug) {
          const { data, error } = await supabase
            .from('cms_menus')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

          if (error) {
            return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
          }
          return NextResponse.json({ menu: data });
        }

        const { data, error } = await supabase
          .from('cms_menus')
          .select('*')
          .eq('is_active', true);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ menus: data });
      }

      // ==================== CATEGORIES ====================
      case 'categories': {
        const { data, error } = await supabase
          .from('cms_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ categories: data });
      }

      // ==================== SEARCH ALL ====================
      case 'search': {
        if (!search) {
          return NextResponse.json({ error: 'Search query required' }, { status: 400 });
        }

        const [postsRes, articlesRes, faqsRes] = await Promise.all([
          supabase
            .from('cms_posts')
            .select('id, title, slug, excerpt')
            .eq('status', 'published')
            .or(`title.ilike.%${search}%,content.ilike.%${search}%`)
            .limit(5),
          supabase
            .from('kb_articles')
            .select('id, title, slug, collection_id')
            .eq('status', 'published')
            .or(`title.ilike.%${search}%,content.ilike.%${search}%`)
            .limit(5),
          supabase
            .from('cms_faqs')
            .select('id, question, answer, category')
            .eq('is_active', true)
            .or(`question.ilike.%${search}%,answer.ilike.%${search}%`)
            .limit(5)
        ]);

        return NextResponse.json({
          results: {
            posts: postsRes.data || [],
            articles: articlesRes.data || [],
            faqs: faqsRes.data || []
          },
          query: search
        });
      }

      default:
        return NextResponse.json({ 
          error: 'Invalid type. Use: pages, posts, articles, collections, faqs, media, menus, categories, search' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('CMS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create CMS content (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Generate slug if not provided
    if (data.title && !data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    let tableName: string;
    switch (type) {
      case 'page': tableName = 'cms_pages'; break;
      case 'post': tableName = 'cms_posts'; break;
      case 'article': tableName = 'kb_articles'; break;
      case 'faq': tableName = 'cms_faqs'; break;
      case 'collection': tableName = 'kb_collections'; break;
      case 'menu': tableName = 'cms_menus'; break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Handle publishing
    if (data.status === 'published' && !data.published_at) {
      data.published_at = new Date().toISOString();
    }

    const { data: created, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, [type]: created });

  } catch (error) {
    console.error('CMS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update CMS content
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let tableName: string;
    switch (type) {
      case 'page': tableName = 'cms_pages'; break;
      case 'post': tableName = 'cms_posts'; break;
      case 'article': tableName = 'kb_articles'; break;
      case 'faq': tableName = 'cms_faqs'; break;
      case 'collection': tableName = 'kb_collections'; break;
      case 'menu': tableName = 'cms_menus'; break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Handle publishing
    if (updates.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, [type]: data });

  } catch (error) {
    console.error('CMS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete CMS content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id required' }, { status: 400 });
    }

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let tableName: string;
    switch (type) {
      case 'page': tableName = 'cms_pages'; break;
      case 'post': tableName = 'cms_posts'; break;
      case 'article': tableName = 'kb_articles'; break;
      case 'faq': tableName = 'cms_faqs'; break;
      case 'collection': tableName = 'kb_collections'; break;
      case 'menu': tableName = 'cms_menus'; break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Soft delete (archive) for pages, posts, articles
    if (['cms_pages', 'cms_posts', 'kb_articles'].includes(tableName)) {
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Hard delete for FAQs, menus, etc.
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Content deleted' });

  } catch (error) {
    console.error('CMS API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
