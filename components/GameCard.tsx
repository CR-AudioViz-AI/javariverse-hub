// CR AudioViz AI - Game Card Component
// Session: 2025-10-25 Phase 5 Build
// Component: components/GameCard.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Heart, Users, Star } from 'lucide-react'

interface GameCardProps {
  game: {
    id: string
    slug: string
    title: string
    description: string
    thumbnail_url: string
    category: string
    tags: string[]
    plays_count: number
    rating: number
    featured: boolean
  }
  onFavorite?: (gameId: string) => void
  isFavorited?: boolean
}

export default function GameCard({ game, onFavorite, isFavorited }: GameCardProps) {
  const [favorited, setFavorited] = useState(isFavorited || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent Link navigation
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          action: 'favorite'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setFavorited(data.favorited)
        onFavorite?.(game.id)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Link href={`/games/${game.slug}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
        {/* Featured Badge */}
        {game.featured && (
          <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-2 py-1 rounded text-xs font-bold">
            <Star className="w-3 h-3 inline mr-1" />
            FEATURED
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${
              favorited 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 dark:text-gray-400'
            }`} 
          />
        </button>

        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {game.thumbnail_url ? (
            <Image
              src={game.thumbnail_url}
              alt={game.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-8 h-8 text-blue-600 ml-1" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {game.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {game.description}
          </p>

          {/* Category & Stats */}
          <div className="flex items-center justify-between">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              {game.category}
            </span>
            
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{game.plays_count || 0}</span>
              </div>
              {game.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                  <span>{game.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {game.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
