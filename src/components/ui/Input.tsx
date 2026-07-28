'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, fullWidth = true, ...props }, ref) => {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label className="block text-sm font-medium text-text/80 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'px-4 py-2.5 bg-background/50 border rounded-lg text-text placeholder:text-text/40',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent',
            'transition-all duration-200',
            error 
              ? 'border-accent' 
              : 'border-primary/20 hover:border-primary/40',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text/40">{helperText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-accent">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';