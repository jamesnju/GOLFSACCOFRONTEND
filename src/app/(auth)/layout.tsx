import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Golf SACCO',
  description: 'Login or register to access your Golf SACCO account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}