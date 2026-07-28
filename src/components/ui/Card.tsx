'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary/5 border-primary/20',
      primary: 'bg-primary/10 border-primary/30',
      secondary: 'bg-secondary/10 border-secondary/30',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border p-6 backdrop-blur-sm',
          variants[variant],
          hoverable && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';