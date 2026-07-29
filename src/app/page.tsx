'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  HomeIcon,
  WalletIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  TrophyIcon,
  UsersIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-secondary">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-secondary/95 backdrop-blur-xl border-b border-primary/10'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">⛳</span>
              <div>
                <h1 className="text-xl font-heading font-bold text-text">Golf SACCO</h1>
                <p className="text-xs text-text/70 hidden sm:block">Savings & Credit</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-all duration-200 font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2 text-text hover:text-primary transition-colors duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-all duration-200 font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90" />
        
        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate={heroInView ? 'visible' : 'hidden'}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <div className="space-y-8">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm"
              >
                <SparklesIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text">🚀 Premium Golf SACCO</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight text-text"
              >
                Empower Your{' '}
                <span className="text-primary">Golfing Journey</span>
                {' '}with Smart Savings
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-text/80 leading-relaxed max-w-lg"
              >
                Join the premier Savings and Credit Cooperative for golf enthusiasts. 
                Save, grow your money, and access loans for your golfing needs.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/register"
                  className="px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary/80 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  Get Started
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 border border-primary/40 text-text rounded-lg hover:bg-primary/10 transition-all duration-200 font-medium"
                >
                  Learn More
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-8 pt-4"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-text/80">Secure & Trusted</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-text/80">24/7 Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-text/80">Community Driven</span>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Hero Image/Stats */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="col-span-2 p-6 rounded-2xl bg-background/20 backdrop-blur-md border border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text/80">Total Savings</p>
                      <p className="text-3xl font-bold text-text">KES 2.5M+</p>
                    </div>
                    <WalletIcon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="mt-2 w-full h-2 bg-background/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full animate-pulse" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl bg-background/20 backdrop-blur-md border border-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text/80">Active Loans</p>
                      <p className="text-2xl font-bold text-text">45</p>
                    </div>
                    <DocumentTextIcon className="w-8 h-8 text-accent" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl bg-background/20 backdrop-blur-md border border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text/80">Members</p>
                      <p className="text-2xl font-bold text-text">150+</p>
                    </div>
                    <UserGroupIcon className="w-8 h-8 text-primary" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="col-span-2 p-4 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-text" />
                    <div>
                      <p className="text-sm font-medium text-text">Join 150+ Golfers</p>
                      <p className="text-xs text-text/70">Start saving today</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 bg-secondary/95"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-heading font-bold text-text">
              Why Choose{' '}
              <span className="text-primary">Golf SACCO</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-text/70 max-w-2xl mx-auto">
              Everything you need to manage your golfing finances in one place
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="group p-6 rounded-2xl bg-background/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-text/70">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 bg-secondary/90"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center p-6 rounded-2xl bg-background/10 backdrop-blur-sm border border-primary/20"
              >
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="mt-2 text-sm text-text/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/30 via-secondary to-accent/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-text mb-6">
              Ready to Start Your{' '}
              <span className="text-primary">Golfing Journey</span>?
            </h2>
            <p className="text-lg text-text/70 mb-8">
              Join thousands of golfers who trust Golf SACCO for their financial needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-primary text-background rounded-lg hover:bg-primary/80 transition-all duration-200 font-medium flex items-center gap-2"
              >
                Get Started Now
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-primary/40 text-text rounded-lg hover:bg-primary/10 transition-all duration-200 font-medium"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/20 bg-secondary/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⛳</span>
                <div>
                  <h3 className="text-xl font-bold text-text">Golf SACCO</h3>
                  <p className="text-xs text-text/60">Savings & Credit</p>
                </div>
              </div>
              <p className="text-sm text-text/60">
                Empowering golfers with smart financial solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-text/60">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-text/60">
                <li><Link href="/savings" className="hover:text-primary transition-colors">Savings</Link></li>
                <li><Link href="/loans" className="hover:text-primary transition-colors">Loans</Link></li>
                <li><Link href="/transactions" className="hover:text-primary transition-colors">Transactions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text/60">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary/20 text-center text-sm text-text/50">
            <p>&copy; {new Date().getFullYear()} Golf SACCO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Data
const features = [
  {
    icon: WalletIcon,
    title: 'Easy Savings',
    description: 'Deposit and grow your savings with competitive returns and real-time tracking.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Quick Loans',
    description: 'Access loans up to 3x your savings after 6 months of active membership.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Platform',
    description: 'Your money and data are protected with enterprise-grade security and encryption.',
  },
  {
    icon: ChartBarIcon,
    title: 'Real-time Analytics',
    description: 'Track your financial growth with detailed reports and insights.',
  },
  {
    icon: UsersIcon,
    title: 'Community Driven',
    description: 'Join a community of golf enthusiasts building financial freedom together.',
  },
  {
    icon: BanknotesIcon,
    title: 'Flexible Terms',
    description: 'Choose loan terms that work for you with competitive interest rates.',
  },
];

const stats = [
  { value: '150+', label: 'Active Members' },
  { value: '2.5M+', label: 'Total Savings (KES)' },
  { value: '45+', label: 'Loans Disbursed' },
  { value: '98%', label: 'Member Satisfaction' },
];