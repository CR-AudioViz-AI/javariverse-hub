// lib/javari/knowledge-processor.ts
// CR AudioViz AI - Javari AI Knowledge Ingestion System
// Henderson Standard: Fortune 50 Quality

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import pdfParse from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Configuration
const CHUNK_SIZE = 1000 // tokens
const CHUNK_OVERLAP = 200 // tokens
const EMBEDDING_MODEL = 'text-embedding-ada-002'

// =====================================================
// MAIN PROCESSOR CLASS
// =====================================================

export class JavariKnowledgeProcessor {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = supabase
  }

  // Process a single knowledge source
  async processSource(sourceId: string): Promise<void> {
    console.log(`📚 Processing knowledge source: ${sourceId}`)

    try {
      // Update status to processing
      await this.updateSourceStatus(sourceId, 'processing')

      // Get source details
      const { data: source, error } = await this.supabase
        .from('javari_knowledge_sources')
        .select('*')
        .eq('id', sourceId)
        .single()

      if (error || !source) {
        throw new Error(`Source not found: ${sourceId}`)
      }

      // Extract text based on source type
      let text: string
      switch (source.source_type) {
        case 'ebook':
        case 'document':
          text = await this.extractFromFile(source.source_path)
          break
        case 'webpage':
          text = await this.extractFromUrl(source.source_path)
          break
        case 'manual':
          text = source.description || ''
          break
        default:
          throw new Error(`Unknown source type: ${source.source_type}`)
      }

      if (!text || text.length < 100) {
        throw new Error('Extracted text too short or empty')
      }

      // Chunk the text
      const chunks = this.chunkText(text)
      console.log(`   Created ${chunks.length} chunks`)

      // Generate embeddings and store chunks
      let totalTokens = 0
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        
        // Generate embedding
        const embedding = await this.generateEmbedding(chunk.content)
        
        // Store chunk with embedding
        await this.supabase.from('javari_knowledge_chunks').insert({
          source_id: sourceId,
          content: chunk.content,
          chunk_index: i,
          section_title: chunk.section,
          token_count: chunk.tokens,
          character_count: chunk.content.length,
          embedding: embedding
        })

        totalTokens += chunk.tokens
      }

      // Update source with stats
      await this.supabase
        .from('javari_knowledge_sources')
        .update({
          status: 'completed',
          total_chunks: chunks.length,
          total_tokens: totalTokens,
          total_characters: text.length,
          processed_at: new Date().toISOString(),
          content_hash: this.hashContent(text)
        })
        .eq('id', sourceId)

      // Log completion
      await this.logChange(sourceId, 'completed', `Processed ${chunks.length} chunks, ${totalTokens} tokens`)

      console.log(`✅ Completed: ${source.source_name}`)

    } catch (error) {
      console.error(`❌ Error processing source ${sourceId}:`, error)
      
      await this.updateSourceStatus(sourceId, 'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      )

      throw error
    }
  }

  // Extract text from file in storage
  private async extractFromFile(storagePath: string): Promise<string> {
    const [bucket, ...pathParts] = storagePath.split('/')
    const filePath = pathParts.join('/')

    // Download file
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(filePath)

    if (error || !data) {
      throw new Error(`Failed to download file: ${error?.message}`)
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    const fileName = filePath.toLowerCase()

    // Extract based on file type
    if (fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer)
      return pdfData.text
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return buffer.toString('utf-8')
    } else if (fileName.endsWith('.docx')) {
      // For DOCX, we'll need mammoth or similar
      // For now, return a placeholder - implement with mammoth.js
      throw new Error('DOCX extraction not yet implemented')
    } else if (fileName.endsWith('.epub')) {
      // For EPUB, use epub-parser
      throw new Error('EPUB extraction not yet implemented')
    }

    throw new Error(`Unsupported file type: ${fileName}`)
  }

  // Extract text from URL
  private async extractFromUrl(url: string): Promise<string> {
    const response = await fetch(url)
    const html = await response.text()
    
    // Basic HTML to text conversion (use cheerio for better results)
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Chunk text into manageable pieces
  private chunkText(text: string): Array<{
    content: string
    section: string
    tokens: number
  }> {
    const chunks: Array<{ content: string; section: string; tokens: number }> = []
    
    // Split by paragraphs first
    const paragraphs = text.split(/

+/)
    
    let currentChunk = ''
    let currentSection = ''
    let currentTokens = 0

    for (const para of paragraphs) {
      const paraTokens = this.estimateTokens(para)

      // Check for section headers
      const headerMatch = para.match(/^#+\s+(.+)$/) || para.match(/^([A-Z][^.!?]*):?\s*$/)
      if (headerMatch) {
        currentSection = headerMatch[1].slice(0, 100)
      }

      // If adding this paragraph would exceed chunk size
      if (currentTokens + paraTokens > CHUNK_SIZE && currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          section: currentSection,
          tokens: currentTokens
        })
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, CHUNK_OVERLAP)
        currentChunk = overlapText + '

' + para
        currentTokens = this.estimateTokens(currentChunk)
      } else {
        currentChunk += (currentChunk ? '

' : '') + para
        currentTokens += paraTokens
      }
    }

    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        section: currentSection,
        tokens: currentTokens
      })
    }

    return chunks
  }

  // Generate embedding using OpenAI
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 8000) // Limit input length
    })

    return response.data[0].embedding
  }

  // Estimate token count
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  // Get overlap text from end of chunk
  private getOverlapText(text: string, targetTokens: number): string {
    const targetChars = targetTokens * 4
    if (text.length <= targetChars) return text
    
    const overlapStart = text.length - targetChars
    const sentenceStart = text.indexOf('. ', overlapStart)
    
    return sentenceStart > overlapStart 
      ? text.slice(sentenceStart + 2)
      : text.slice(overlapStart)
  }

  // Hash content for change detection
  private hashContent(text: string): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(text).digest('hex')
  }

  // Update source status
  private async updateSourceStatus(
    sourceId: string, 
    status: string, 
    errorMessage?: string
  ): Promise<void> {
    await this.supabase
      .from('javari_knowledge_sources')
      .update({
        status,
        error_message: errorMessage || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sourceId)
  }

  // Log change for alerting
  private async logChange(
    sourceId: string, 
    changeType: string, 
    description: string
  ): Promise<void> {
    await this.supabase.from('javari_knowledge_changelog').insert({
      source_id: sourceId,
      change_type: changeType,
      change_description: description,
      triggered_by: 'system'
    })
  }

  // =====================================================
  // SEARCH FUNCTIONALITY
  // =====================================================

  // Search knowledge base
  async search(query: string, options?: {
    matchThreshold?: number
    matchCount?: number
    sourceTypes?: string[]
  }): Promise<Array<{
    content: string
    sourceName: string
    sourceType: string
    section: string
    similarity: number
  }>> {
    const threshold = options?.matchThreshold || 0.7
    const count = options?.matchCount || 10

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query)

    // Search using the database function
    const { data, error } = await this.supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: count
    })

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    return data.map((result: any) => ({
      content: result.content,
      sourceName: result.source_name,
      sourceType: result.source_type || 'unknown',
      section: result.section_title || '',
      similarity: result.similarity
    }))
  }

  // =====================================================
  // QUEUE PROCESSING
  // =====================================================

  // Process pending queue items
  async processQueue(limit = 10): Promise<number> {
    // Get pending items
    const { data: items, error } = await this.supabase
      .from('javari_knowledge_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error || !items) {
      console.error('Failed to fetch queue:', error)
      return 0
    }

    let processed = 0

    for (const item of items) {
      try {
        // Mark as processing
        await this.supabase
          .from('javari_knowledge_queue')
          .update({ 
            status: 'processing', 
            started_at: new Date().toISOString() 
          })
          .eq('id', item.id)

        // Process based on task type
        if (item.task_type === 'extract') {
          await this.processSource(item.source_id)
        }

        // Mark as completed
        await this.supabase
          .from('javari_knowledge_queue')
          .update({ 
            status: 'completed', 
            completed_at: new Date().toISOString() 
          })
          .eq('id', item.id)

        processed++

      } catch (error) {
        // Mark as failed
        await this.supabase
          .from('javari_knowledge_queue')
          .update({ 
            status: item.attempts + 1 >= item.max_attempts ? 'failed' : 'pending',
            attempts: item.attempts + 1,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            scheduled_for: new Date(Date.now() + 300000).toISOString() // Retry in 5 min
          })
          .eq('id', item.id)
      }
    }

    return processed
  }
}

// Export singleton instance
export const knowledgeProcessor = new JavariKnowledgeProcessor()