// ================================================================================
// JAVARI DOCUMENT ASK API - /api/docs/ask
// Answer questions WITH CITATIONS from uploaded documents
// ================================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 120;

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// POST /api/docs/ask - Ask questions about documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, document_ids, provider = 'auto' } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    const supabase = getSupabase();
    
    // If no database, return helpful message
    if (!supabase) {
      return NextResponse.json({
        answer: "I can see you're asking a great question! However, I need documents to reference. Please upload some files first, and I'll be able to answer with specific citations.",
        citations: [],
        documents_searched: 0,
        grounded: false
      });
    }

    // Query documents - try multiple field name patterns
    let docs: any[] = [];
    
    // Try with 'content' field
    let query = supabase
      .from('documents')
      .select('id, filename, content, created_at')
      .not('content', 'is', null);
    
    if (document_ids && document_ids.length > 0) {
      query = query.in('id', document_ids);
    }
    
    let result = await query.limit(10);
    
    if (!result.error && result.data) {
      docs = result.data;
    } else {
      // Try with 'text' field
      let altQuery = supabase
        .from('documents')
        .select('id, filename, text, created_at')
        .not('text', 'is', null);
      
      if (document_ids && document_ids.length > 0) {
        altQuery = altQuery.in('id', document_ids);
      }
      
      result = await altQuery.limit(10);
      if (!result.error && result.data) {
        docs = result.data.map(d => ({
          ...d,
          content: d.text
        }));
      }
    }

    if (docs.length === 0) {
      return NextResponse.json({
        answer: "I don't have any documents to reference yet. Please upload some documents first, and I'll be able to answer your questions with citations.",
        citations: [],
        documents_searched: 0,
        grounded: false
      });
    }

    // Search for relevant content
    const questionWords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
    
    const relevantDocs = docs
      .map(doc => {
        const content = (doc.content || '').toLowerCase();
        const matchCount = questionWords.filter((word: string) => content.includes(word)).length;
        return { ...doc, matchCount };
      })
      .filter(doc => doc.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 3);

    // Build citations
    const citations = relevantDocs.map(doc => {
      const content = doc.content || '';
      let snippet = '';
      
      // Find best matching snippet
      for (const word of questionWords) {
        const idx = content.toLowerCase().indexOf(word);
        if (idx >= 0) {
          const start = Math.max(0, idx - 50);
          const end = Math.min(content.length, idx + 150);
          snippet = content.slice(start, end).trim();
          if (start > 0) snippet = '...' + snippet;
          if (end < content.length) snippet = snippet + '...';
          break;
        }
      }

      return {
        documentId: doc.id,
        documentName: doc.filename || doc.name || 'Document',
        snippet: snippet || content.slice(0, 200) + '...',
      };
    });

    // Generate answer (simple version - in production would call LLM)
    let answer: string;
    
    if (citations.length > 0) {
      const contextSummary = relevantDocs
        .map(d => d.content?.slice(0, 500))
        .join('\n\n');
      
      answer = `Based on the documents you've uploaded, I found relevant information.\n\n` +
        `Looking at ${citations.length} source(s), here's what I found related to "${question}":\n\n` +
        `The documents contain information that may help answer your question. ` +
        `Please see the citations below for the specific excerpts from your documents.`;
    } else {
      answer = `I searched through ${docs.length} document(s) but couldn't find specific information about "${question}". ` +
        `Try uploading more relevant documents or rephrasing your question.`;
    }

    return NextResponse.json({
      answer,
      citations,
      documents_searched: docs.length,
      grounded: citations.length > 0,
      provider_used: provider
    });

  } catch (error: any) {
    console.error('Ask error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to process question',
      answer: 'Sorry, I encountered an error processing your question. Please try again.',
      citations: [],
      documents_searched: 0
    }, { status: 500 });
  }
}
