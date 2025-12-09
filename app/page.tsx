"use client";

import { Jar3D } from "@/components/Jar3D";
import { Button } from "@/components/ui/Button";
import { Heart, Sparkles, Calendar, Utensils, Wine, Shuffle, Users, ArrowRight, Star, CheckCircle2, User } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 flex flex-col items-start gap-4 hover:bg-white/10 transition-colors group"
    >
      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
        <Icon className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 relative z-10">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-primary/25">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-accent transition-colors">{question}</span>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white" style={{ transform: 'rotate(90deg)' }} />
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Check login status
  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
          router.push('/dashboard');
        }
      })
      .catch(err => console.error("Auth check failed:", err));
  }, [router]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Date Jar',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A fun, interactive way for couples to decide on their next date.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '500',
    },
    featureList: 'Date Ideas Generator, Couple Sync, Weekend Planner, Dining Concierge',
    screenshot: 'https://date-jar.vercel.app/og-image.jpg',
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does the date idea generator work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
          }
        },
        {
          '@type': 'Question',
          name: 'Is Date Jar free for couples?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can create a jar, add unlimited ideas, and sync with your partner for free. We also offer a premium tier for advanced features like the Smart Weekend Planner and Dining Concierge.'
          }
        },
        {
          '@type': 'Question',
          name: 'Can I find restaurants for date night?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Our Dining Concierge feature helps you find top-rated romantic restaurants near you, complete with reviews, ratings, and price levels.'
          }
        },
        {
          '@type': 'Question',
          name: 'Does it sync between two phones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Date Jar is designed for couples. Once you invite your partner using your unique code, your jars are instantly linked. Any idea added or removed on one phone appears on the other immediately.'
          }
        }
      ]
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen relative overflow-hidden bg-slate-950 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">Date Jar</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => router.push('/dashboard')} size="sm" className="bg-white/10 hover:bg-white/20 border-none">
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Button onClick={() => router.push('/signup')} size="sm" className="bg-white text-slate-900 hover:bg-slate-200 border-none">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-center md:text-left w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-accent">
              <Sparkles className="w-3 h-3" />
              <span>Reignite the spark</span>
            </div>
            <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 tracking-tight leading-[1.1] break-words">
              The Ultimate <br />
              <span className="text-accent">Date Idea Generator</span> <br />
              For Couples.
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed break-words">
              Stop scrolling and start dating. Our <strong>shared app for couples</strong> helps you curate, manage, and discover <strong>romantic date ideas</strong>.
              Let fate decide your next adventure or use our <strong>smart date planner</strong> for the perfect weekend.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button
                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 w-full sm:w-auto"
              >
                {user ? "Go to Dashboard" : "Create Your Jar"} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <a
                href="#features"
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Learn how it works
              </a>
            </div>
            <div className="pt-4 flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs text-white">
                    <User className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <p>Loved by 500+ couples</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative h-[400px] md:h-[600px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="scale-90 md:scale-150 relative z-10">
              <Jar3D />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Everything You Need for <br /><span className="text-accent">Better Dates</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We've packed Date Jar with features designed to take the stress out of planning and put the fun back into dating.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Shuffle}
              title="Spin the Jar"
              description="Overcome decision paralysis with our random date generator. Filter by cost, duration, or vibe and let fate decide."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              title="Partner Sync"
              description="The perfect app for couples. Invite your partner to your jar and sync date ideas instantly across both devices."
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title="Weekend Planner"
              description="Build a complete romantic itinerary. Our smart planner creates custom weekend plans based on your location."
              delay={0.3}
            />

            <FeatureCard
              icon={Utensils}
              title="Dining Concierge"
              description="Find romantic restaurants for date night. Get curated recommendations with ratings specifically for couples."
              delay={0.4}
            />
            <FeatureCard
              icon={Wine}
              title="Bar Scout"
              description="Discover hidden speakeasies and rooftop bars. The best nightlife spots for after-dinner drinks."
              delay={0.5}
            />
            <FeatureCard
              icon={Star}
              title="Rate & Remember"
              description="Keep a digital scrapbook of your relationship. Rate dates, add private notes, and cherish your memories."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0" />

            <StepCard
              number="1"
              title="Create Your Jar"
              description="Sign up and create a digital jar. Add your favorite date ideas or use our generator to find some."
            />
            <StepCard
              number="2"
              title="Invite Partner"
              description="Send a unique invite code to your partner so you can both contribute and manage the jar."
            />
            <StepCard
              number="3"
              title="Spin & Go"
              description="When date night comes, spin the jar to pick an activity. No more indecision!"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-slate-950/50 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about your new favorite couples app.</p>
          </div>

          <div className="glass-card p-6 md:p-8 space-y-2">
            <FaqItem
              question="How does the date idea generator work?"
              answer="Simply add your own ideas or use our pre-filled categories. When you're ready, filter by budget, time, or energy level, and 'Spin the Jar' to get a random suggestion that fits your mood perfectly."
            />
            <FaqItem
              question="Is Date Jar free for couples?"
              answer="Yes! You can create a jar, add unlimited ideas, and sync with your partner for free. We also offer a premium tier for advanced features like the Smart Weekend Planner and Dining Concierge."
            />
            <FaqItem
              question="Can I find restaurants for date night?"
              answer="Absolutely. Our Dining Concierge feature helps you find top-rated romantic restaurants near you, complete with reviews, ratings, and price levels."
            />
            <FaqItem
              question="Does it sync between two phones?"
              answer="Yes. Date Jar is designed for couples. Once you invite your partner using your unique code, your jars are instantly linked. Any idea added or removed on one phone appears on the other immediately."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20" />
          <div className="glass-card p-12 rounded-3xl text-center relative overflow-hidden border-white/10">
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to spice things up?</h2>
              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                Join thousands of couples who are having better dates, more often. It's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => router.push('/signup')}
                  className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-200 border-none w-full sm:w-auto"
                >
                  Create Your Jar Now
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Free 14-day trial of premium features</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /> Then just AU$2.50 / month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-slate-600" />
            <span className="font-bold text-slate-400">Date Jar</span>
          </div>
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Date Jar. Built for love.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:hello@datejar.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main >
  );
}
