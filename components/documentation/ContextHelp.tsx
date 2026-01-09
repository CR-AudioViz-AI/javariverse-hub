'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, X, Search, MessageCircle, FileText, ExternalLink, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'

interface Doc {
  id: string
  title: string
  category: string
  subcategory?: string
  content: string
}

interface ContextHelpProps {
  contextKey: string // e.g., 'dashboard.overview', 'javari.chat', 'admin.users'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className?: string
}

export function ContextHelp({ 
  contextKey, 
  position = 'bottom-right',
  className = '' 
}: ContextHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'docs' | 'ai' | 'ticket'>('docs')
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState<Doc[]>([])
  const [context, setContext] = useState<any>(null)
  const [question, setQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState<any>(null)
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    type: 'unclear' as 'bug' | 'missing' | 'unclear' | 'outdated' | 'feature_request',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })

  // Load context and related docs
  useEffect(() => {
    if (isOpen && activeTab === 'docs') {
      loadContextDocs()
    }
  }, [isOpen, activeTab, contextKey])

  const loadContextDocs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documentation?context=${encodeURIComponent(contextKey)}`)
      const data = await response.json()
      setContext(data.context)
      setDocs(data.docs || [])
    } catch (error) {
      console.error('Failed to load context docs:', error)
    } finally {
      setLoading(false)
    }
  }

  const askAI = async () => {
    if (!question.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/documentation/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            contextKey,
            page: window.location.pathname
          }
        })
      })

      const data = await response.json()
      setAiAnswer(data)
    } catch (error) {
      console.error('Failed to get AI answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const rateAnswer = async (questionId: string, rating: 1 | 5) => {
    try {
      await fetch('/api/documentation/ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          rating
        })
      })
      
      if (aiAnswer?.question_id === questionId) {
        setAiAnswer({ ...aiAnswer, rated: true })
      }
    } catch (error) {
      console.error('Failed to rate answer:', error)
    }
  }

  const submitTicket = async () => {
    if (!ticketForm.title || !ticketForm.description) return

    setLoading(true)
    try {
      const response = await fetch('/api/documentation/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm)
      })

      if (response.ok) {
        // Reset form
        setTicketForm({
          title: '',
          description: '',
          type: 'unclear',
          priority: 'medium'
        })
        alert('Ticket submitted successfully!')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Failed to submit ticket:', error)
      alert('Failed to submit ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${className}`}
        aria-label="Get help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Help & Documentation
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('docs')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'docs'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Documentation
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'ai'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Ask AI
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'ticket'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Report Issue
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Documentation Tab */}
              {activeTab === 'docs' && (
                <div className="space-y-4">
                  {context && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        {context.title}
                      </h3>
                      {context.description && (
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          {context.description}
                        </p>
                      )}
                      {context.quick_tips && context.quick_tips.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                            Quick Tips:
                          </p>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            {context.quick_tips.map((tip: string, i: number) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Loading docs...</p>
                    </div>
                  ) : docs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Related Documentation:
                      </h4>
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                                {doc.title}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {doc.content.substring(0, 150)}...
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {doc.category} {doc.subcategory && `• ${doc.subcategory}`}
                              </span>
                            </div>
                            <a
                              href={`/documentation/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                      No documentation found for this context.
                    </div>
                  )}
                </div>
              )}

              {/* AI Tab */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ask a question:
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., How do I reset my password?"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                    <button
                      onClick={askAI}
                      disabled={loading || !question.trim()}
                      className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      {loading ? 'Thinking...' : 'Ask AI'}
                    </button>
                  </div>

                  {aiAnswer && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: aiAnswer.answer }} />
                      </div>

                      {aiAnswer.sources && aiAnswer.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Sources:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiAnswer.sources.map((source: any) => (
                              <a
                                key={source.id}
                                href={`/documentation/${source.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                              >
                                {source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {!aiAnswer.rated && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Was this helpful?
                          </span>
                          <button
                            onClick={() => rateAnswer(aiAnswer.question_id, 5)}
                            className="p-1 hover:bg-cyan-500 dark:hover:bg-cyan-500/20 rounded"
                          >
                            <ThumbsUp className="w-4 h-4 text-cyan-500" />
                          </button>
                          <button
                            onClick={() => rateAnswer(aiAnswer.question_id, 1)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          >
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Ticket Tab */}
              {activeTab === 'ticket' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Issue Type
                    </label>
                    <select
                      value={ticketForm.type}
                      onChange={(e) => setTicketForm({ ...ticketForm, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="unclear">Documentation Unclear</option>
                      <option value="missing">Missing Information</option>
                      <option value="outdated">Outdated Information</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature_request">Feature Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={ticketForm.title}
                      onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      rows={4}
                      placeholder="Provide details about the issue or request"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <button
                    onClick={submitTicket}
                    disabled={loading || !ticketForm.title || !ticketForm.description}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
