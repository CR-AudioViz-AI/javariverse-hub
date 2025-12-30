// /hooks/useCMS.ts
// CMS & Knowledge Base Hook - CR AudioViz AI
'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_json?: any;
  page_type: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
}

interface CMSPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  author_name?: string;
  published_at?: string;
  view_count: number;
  tags?: string[];
}

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  article_type: string;
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
  view_count: number;
  helpful_count: number;
}

interface KBCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  article_count: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  target_module?: string;
  is_featured: boolean;
}

// Hook for pages
export function usePage(slug: string) {
  const [page, setPage] = useState<CMSPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/cms?type=pages&slug=${slug}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        setPage(data.page);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  return { page, isLoading, error };
}

// Hook for blog posts
export function usePosts(options: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const [posts, setPosts] = useState<CMSPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ type: 'posts' });
      if (options.category) params.set('category', options.category);
      if (options.search) params.set('q', options.search);
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.offset) params.set('offset', options.offset.toString());

      const res = await fetch(`/api/cms?${params}`);
      const data = await res.json();
      
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.search, options.limit, options.offset]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, total, isLoading, refresh: fetchPosts };
}

// Hook for single post
export function usePost(slug: string) {
  const [post, setPost] = useState<CMSPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/cms?type=posts&slug=${slug}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        setPost(data.post);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  return { post, isLoading, error };
}

// Hook for knowledge base
export function useKnowledgeBase() {
  const [collections, setCollections] = useState<KBCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cms?type=collections');
      const data = await res.json();
      setCollections(data.collections || []);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, isLoading, refresh: fetchCollections };
}

// Hook for articles in a collection
export function useArticles(options: {
  collection?: string;
  search?: string;
  limit?: number;
} = {}) {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ type: 'articles' });
      if (options.collection) params.set('collection', options.collection);
      if (options.search) params.set('q', options.search);
      if (options.limit) params.set('limit', options.limit.toString());

      const res = await fetch(`/api/cms?${params}`);
      const data = await res.json();
      
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.collection, options.search, options.limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, total, isLoading, refresh: fetchArticles };
}

// Hook for single article
export function useArticle(slug: string, collection?: string) {
  const [article, setArticle] = useState<KBArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        let url = `/api/cms?type=articles&slug=${slug}`;
        if (collection) url += `&collection=${collection}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        setArticle(data.article);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setArticle(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug, collection]);

  return { article, isLoading, error };
}

// Hook for FAQs
export function useFAQs(options: {
  category?: string;
  module?: string;
  grouped?: boolean;
} = {}) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [grouped, setGrouped] = useState<Record<string, FAQ[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchFAQs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ type: 'faqs' });
      if (options.category) params.set('category', options.category);
      if (options.module) params.set('module', options.module);
      if (options.grouped) params.set('grouped', 'true');

      const res = await fetch(`/api/cms?${params}`);
      const data = await res.json();
      
      setFaqs(data.faqs || []);
      if (data.grouped) setGrouped(data.grouped);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.module, options.grouped]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  return { faqs, grouped, isLoading, refresh: fetchFAQs };
}

// Hook for CMS search
export function useCMSSearch(query: string) {
  const [results, setResults] = useState<{
    posts: any[];
    articles: any[];
    faqs: any[];
  }>({ posts: [], articles: [], faqs: [] });
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults({ posts: [], articles: [], faqs: [] });
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/cms?type=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || { posts: [], articles: [], faqs: [] });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return { results, isLoading };
}

// Hook for menus
export function useMenu(slug: string) {
  const [menu, setMenu] = useState<{
    name: string;
    items: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/cms?type=menus&slug=${slug}`);
        const data = await res.json();
        setMenu(data.menu);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [slug]);

  return { menu, isLoading };
}

// Utility: Mark article as helpful
export async function markArticleHelpful(
  articleId: string,
  helpful: boolean
): Promise<boolean> {
  try {
    const field = helpful ? 'helpful_count' : 'not_helpful_count';
    // Would need a dedicated endpoint for this
    // For now, just track locally
    return true;
  } catch (err) {
    return false;
  }
}

// Utility: Create content (admin)
export async function createContent(
  type: 'page' | 'post' | 'article' | 'faq',
  data: Record<string, any>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('/api/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data })
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error };
    
    return { success: true, id: result[type]?.id };
  } catch (err) {
    return { success: false, error: 'Failed to create content' };
  }
}

// Utility: Update content (admin)
export async function updateContent(
  type: 'page' | 'post' | 'article' | 'faq',
  id: string,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/cms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, ...data })
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error };
    
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to update content' };
  }
}

// Utility: Delete content (admin)
export async function deleteContent(
  type: 'page' | 'post' | 'article' | 'faq',
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/cms?type=${type}&id=${id}`, {
      method: 'DELETE'
    });

    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error };
    
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete content' };
  }
}

export default usePosts;
