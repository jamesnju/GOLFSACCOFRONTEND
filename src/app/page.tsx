'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex flex-col bg-background text-text">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-primary">⛳</span>
          <span className="text-2xl font-heading text-text">Golf SACCO</span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-accent transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 text-primary hover:text-accent transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-accent transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            <span className="text-primary">Golf</span> Club
            <br />
            <span className="text-text">Savings & Credit</span> Cooperative
          </h1>
          <p className="text-xl text-text/90 mb-8 max-w-2xl mx-auto">
            Save, grow your money, and access loans for your golfing needs.
            Join the premium SACCO for golf enthusiasts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-primary text-background rounded-lg hover:bg-accent transition-colors text-lg"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mt-16 w-full"
          id="features"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-primary/20 bg-background hover:bg-primary/5 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-text mb-2">{feature.title}</h3>
              <p className="text-text/80 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-6 text-center text-text/70 text-sm">
        <p>&copy; {new Date().getFullYear()} Golf Club SACCO. All rights reserved.</p>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: '💰',
    title: 'Easy Savings',
    description: 'Deposit and grow your savings with competitive returns.',
  },
  {
    icon: '🏦',
    title: 'Quick Loans',
    description: 'Access loans up to 3x your savings after 6 months.',
  },
  {
    icon: '📊',
    title: 'Real-time Tracking',
    description: 'Monitor your savings, loans, and transactions instantly.',
  },
  {
    icon: '🛡️',
    title: 'Secure Platform',
    description: 'Your money and data are protected with enterprise-grade security.',
  },
];