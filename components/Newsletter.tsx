'use client'

import { useState } from 'react'
import { Mail, CheckCircle, TrendingUp, Gift } from 'lucide-react'

export default function NewsletterSystem() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    // API call would go here
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500 to-cyan-500 text-white rounded-xl p-8">
      {!subscribed ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Mail size={32} />
            <h2 className="text-3xl font-bold">Stay Updated</h2>
          </div>
          <p className="text-lg mb-6 opacity-90">
            Get weekly updates on new features, tips, and exclusive offers. 
            Plus, earn 50 free credits for subscribing!
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-3 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-white text-cyan-500 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} />
              <span>Weekly Tips</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <span>Exclusive Offers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span>No Spam</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle size={64} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're Subscribed!</h3>
          <p className="text-lg opacity-90 mb-4">
            Check your email for confirmation and your 50 bonus credits.
          </p>
          <p className="text-sm opacity-75">
            You can unsubscribe anytime from any email we send.
          </p>
        </div>
      )}
    </div>
  )
}
