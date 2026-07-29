'use client';

import { useRouter } from 'next/navigation';

export function QuickActionButton({ href, icon, label }: { href: string; icon: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-200"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm text-text">{label}</span>
    </button>
  );
}