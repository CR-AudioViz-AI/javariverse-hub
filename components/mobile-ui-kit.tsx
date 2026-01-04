// ================================================================================
// CR AUDIOVIZ AI - MOBILE UI KIT
// Shared mobile-first components for all apps
// WCAG 2.2 AA Compliant | Touch-optimized | 44px minimum targets
// ================================================================================

'use client';

import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export const tokens = {
  // Touch targets - WCAG 2.2 AA minimum 44x44px
  touchTarget: {
    min: '44px',
    comfortable: '48px',
    large: '56px',
  },
  
  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // Typography - mobile optimized
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px', // Minimum for mobile readability
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
  },
  
  // Border radius
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  // Colors - High contrast for accessibility
  colors: {
    primary: {
      DEFAULT: '#2563eb',
      hover: '#1d4ed8',
      active: '#1e40af',
      light: '#dbeafe',
    },
    secondary: {
      DEFAULT: '#7c3aed',
      hover: '#6d28d9',
      active: '#5b21b6',
      light: '#ede9fe',
    },
    success: {
      DEFAULT: '#16a34a',
      light: '#dcfce7',
    },
    error: {
      DEFAULT: '#dc2626',
      light: '#fee2e2',
    },
    warning: {
      DEFAULT: '#d97706',
      light: '#fef3c7',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
};

// =============================================================================
// MOBILE BUTTON
// =============================================================================

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'left',
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      select-none
    `;
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
      secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 active:bg-purple-800',
      outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-200 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    };
    
    const sizes = {
      sm: 'min-h-[44px] px-4 text-sm',
      md: 'min-h-[48px] px-6 text-base',
      lg: 'min-h-[56px] px-8 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);
MobileButton.displayName = 'MobileButton';

// =============================================================================
// MOBILE INPUT
// =============================================================================

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full min-h-[48px] px-4 py-3
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              text-base text-gray-900 dark:text-white
              bg-white dark:bg-gray-800
              border-2 rounded-xl
              ${error 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }
              focus:outline-none focus:ring-2
              placeholder:text-gray-400
              disabled:opacity-50 disabled:bg-gray-100
              transition-colors duration-200
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
MobileInput.displayName = 'MobileInput';

// =============================================================================
// MOBILE CARD
// =============================================================================

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  padding = 'md',
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        w-full rounded-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-sm
        ${paddingStyles[padding]}
        ${interactive || onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.99] transition-all duration-200' : ''}
        ${onClick ? 'text-left' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

// =============================================================================
// MOBILE BOTTOM SHEET
// =============================================================================

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        
        {title && (
          <h2 id="sheet-title" className="text-lg font-semibold text-center px-4 pb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
        )}
        
        <div className="px-4 pb-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </>
  );
};

// =============================================================================
// MOBILE NAV BAR
// =============================================================================

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface MobileNavBarProps {
  items: NavItem[];
  onNavigate: (href: string) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ items, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onNavigate(item.href)}
            className={`
              flex flex-col items-center justify-center
              min-w-[64px] min-h-[44px] px-3 py-1
              rounded-lg transition-colors
              ${item.active 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// =============================================================================
// MOBILE LOADING SKELETON
// =============================================================================

interface MobileSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const MobileSkeleton: React.FC<MobileSkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  tokens,
  MobileButton,
  MobileInput,
  MobileCard,
  MobileBottomSheet,
  MobileNavBar,
  MobileSkeleton,
};
