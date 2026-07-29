'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { motion, useInView } from 'framer-motion';
import {
  WalletIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon,
  BanknotesIcon,
  TrophyIcon,
  UsersIcon,
  ArrowPathIcon,
  StarIcon,
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

// Animated Counter Component
function AnimatedCounter({ 
  target, 
  suffix = '', 
  prefix = '', 
  duration = 2000,
  isPercentage = false 
}: { 
  target: number; 
  suffix?: string; 
  prefix?: string; 
  duration?: number;
  isPercentage?: boolean;
}) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(counterRef, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      
      setCount(current);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, target, duration]);

  return (
    <div ref={counterRef} className="text-4xl font-bold text-primary">
      {prefix}
      {isPercentage ? count : count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Floating particles for hero background
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

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
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-primary/10'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">⛳</span>
              <div>
                <h1 className="text-xl font-heading font-bold text-text">Golf SACCO</h1>
                <p className="text-xs text-text/50 hidden sm:block">Savings & Credit</p>
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

      {/* Hero Section with Background Image */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/golf-hero-bg.png"
            alt="Golf Course Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-pulse" />

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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30"
              >
                <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-text">🚀 Premium Golf SACCO</span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight text-text"
              >
                Empower Your{' '}
                <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Golfing Journey
                </span>
                {' '}with Smart Savings
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg text-text/70 leading-relaxed max-w-lg backdrop-blur-sm bg-background/20 p-4 rounded-xl border border-primary/10"
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
                  className="group px-8 py-3 bg-gradient-to-r from-primary to-accent text-background rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-medium flex items-center gap-2"
                >
                  Get Started
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 border border-primary/40 text-text rounded-lg hover:bg-primary/10 backdrop-blur-sm transition-all duration-200 font-medium"
                >
                  Learn More
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/10">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text/70">Secure & Trusted</span>
                </div>
                <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/10">
                  <ClockIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text/70">24/7 Access</span>
                </div>
                <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/10">
                  <UsersIcon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-text/70">Community</span>
                </div>
              </motion.div>
            </div>

            {/* Right Content - Hero Stats */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className="col-span-2 p-6 rounded-2xl bg-background/30 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text/60">Total Savings</p>
                      <AnimatedCounter target={2500000} prefix="KES " duration={2500} />
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <WalletIcon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 w-full h-2 bg-background/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="p-4 rounded-2xl bg-background/30 backdrop-blur-xl border border-accent/30 shadow-xl shadow-accent/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text/60">Active Loans</p>
                      <AnimatedCounter target={45} duration={2000} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <DocumentTextIcon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className="p-4 rounded-2xl bg-background/30 backdrop-blur-xl border border-primary/30 shadow-xl shadow-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text/60">Members</p>
                      <AnimatedCounter target={150} suffix="+" duration={2000} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl border border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-text" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">
                        Join <AnimatedCounter target={150} suffix="+" duration={2000} /> Golfers
                      </p>
                      <p className="text-xs text-text/50">Start saving today</p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="ml-auto"
                    >
                      <ArrowPathIcon className="w-5 h-5 text-primary/40" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-4 -right-4 lg:top-0 lg:-right-8 bg-primary text-background px-4 py-2 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2"
              >
                <StarIcon className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold">⭐ 5 Star Rated</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-text/40">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [2, 14, 2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-primary/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        id="features"
        className="py-20 bg-background/95"
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
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-text/60 max-w-2xl mx-auto">
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
                className="group p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-lg shadow-primary/5 hover:shadow-primary/10"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-text/60">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 bg-gradient-to-b from-background to-primary/5"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10"
            >
              <AnimatedCounter target={150} suffix="+" duration={2500} />
              <div className="mt-2 text-sm text-text/60">Active Members</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10"
            >
              <AnimatedCounter target={2500000} prefix="KES " duration={3000} />
              <div className="mt-2 text-sm text-text/60">Total Savings</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10"
            >
              <AnimatedCounter target={45} suffix="+" duration={2000} />
              <div className="mt-2 text-sm text-text/60">Loans Disbursed</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10"
            >
              <AnimatedCounter target={98} suffix="%" duration={2500} isPercentage />
              <div className="mt-2 text-sm text-text/60">Member Satisfaction</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,242,43,0.1),transparent_70%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              ⛳
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-text mb-6">
              Ready to Start Your{' '}
              <span className="text-primary">Golfing Journey</span>?
            </h2>
            <p className="text-lg text-text/60 mb-8">
              Join thousands of golfers who trust Golf SACCO for their financial needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-background rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-medium flex items-center gap-2"
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
      <footer className="py-12 border-t border-primary/10 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⛳</span>
                <div>
                  <h3 className="text-xl font-bold text-text">Golf SACCO</h3>
                  <p className="text-xs text-text/50">Savings & Credit</p>
                </div>
              </div>
              <p className="text-sm text-text/50">
                Empowering golfers with smart financial solutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-text/50">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-text/50">
                <li><Link href="/savings" className="hover:text-primary transition-colors">Savings</Link></li>
                <li><Link href="/loans" className="hover:text-primary transition-colors">Loans</Link></li>
                <li><Link href="/transactions" className="hover:text-primary transition-colors">Transactions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text/50">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary/10 text-center text-sm text-text/40">
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