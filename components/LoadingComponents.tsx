// CR AUDIOVIZ AI - Loading States Component
// Session: 2025-10-25 - Phase 4
// Purpose: Consistent loading experiences across the platform

'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'text-blue-600',
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${color} animate-spin`} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

interface LoadingDotsProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingDots({ color = 'bg-blue-600', size = 'md' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`${sizeClasses[size]} ${color} rounded-full animate-bounce [animation-delay:-0.3s]`} />
      <div className={`${sizeClasses[size]} ${color} rounded-full animate-bounce [animation-delay:-0.15s]`} />
      <div className={`${sizeClasses[size]} ${color} rounded-full animate-bounce`} />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  count?: number;
  animated?: boolean;
}

export function Skeleton({ className = '', count = 1, animated = true }: SkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`
        bg-gray-200 rounded 
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-3">{skeletons}</div>;
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function LoadingCard({ title, description, icon }: LoadingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-xl">
            {icon}
          </div>
        )}
        <div className="flex-1 space-y-3">
          {title && (
            <Skeleton className="h-5 w-3/4" />
          )}
          {description && (
            <Skeleton className="h-4 w-full" />
          )}
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  progress?: number;
}

export function LoadingOverlay({ show, text, progress }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <Sparkles className="w-6 h-6 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          {text && (
            <p className="text-lg font-medium text-gray-900 text-center">{text}</p>
          )}

          {progress !== undefined && (
            <div className="w-full">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">{progress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function PageLoading({ title = 'Loading...', description }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full" />
            <div className="w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
            <Sparkles className="w-8 h-8 text-cyan-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>

        <LoadingDots size="md" />
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonLoading({
  loading,
  children,
  loadingText,
  className = '',
  disabled,
  onClick
}: ButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative
        ${loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
      
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText && <span>{loadingText}</span>}
        </span>
      )}
    </button>
  );
}
