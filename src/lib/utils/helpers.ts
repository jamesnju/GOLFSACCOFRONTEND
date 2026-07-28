import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-500 bg-yellow-500/10',
    APPROVED: 'text-green-500 bg-green-500/10',
    REJECTED: 'text-red-500 bg-red-500/10',
    ACTIVE: 'text-blue-500 bg-blue-500/10',
    PAID: 'text-green-500 bg-green-500/10',
    DEFAULTED: 'text-red-500 bg-red-500/10',
    COMPLETED: 'text-green-500 bg-green-500/10',
    FAILED: 'text-red-500 bg-red-500/10',
    CANCELLED: 'text-gray-500 bg-gray-500/10',
  };
  return colors[status] || 'text-text/60 bg-primary/10';
}