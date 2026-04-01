import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Brain, Code, Trophy, Zap, Users, ArrowRight, ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import GlowCard from "@/components/GlowCard";
import AnimatedIcon from "@/components/AnimatedIcon";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Code, title: "Multi-Round Testing", desc: "MCQ, coding challenges, and adaptive difficulty that scales with your performance.", variant: "bounce" as const },
  { icon: Shield, title: "Anti-Cheat Engine", desc: "Real-time monitoring: copy/paste blocking, tab detection, keystroke analysis, behavioral scoring.", variant: "pulse" as const },
  { icon: Brain, title: "AI Analysis", desc: "Code originality detection, AI-generated code flagging, and behavioral trust scoring.", variant: "glow" as const },
  { icon: Trophy, title: "Verified Certificates", desc: "Tamper-proof certificates with QR verification and unique IDs.", variant: "float" as const },
  { icon: Users, title: "Admin Dashboard", desc: "Full candidate analytics, code playback, cheat flagging, and submission review.", variant: "bounce" as const },
  { icon: Zap, title: "Adaptive Engine", desc: "Questions adjust difficulty in real-time. Easy → Medium → Hard → Expert.", variant: "pulse" as const },
];

const stats = [
  { value: "99.2%", label: "Cheat Detection" },
  { value: "15+", label: "Languages" },
  { value: "500+", label: "Challenges" },
  { value: "<2s", label: "Judge Speed" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={28} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm px-3">Login</Button>
            <Button onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-sm px-4 gap-1.5">
              <span className="hidden xs:inline">Get Started</span>
              <span className="xs:hidden">Start</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 px-4 relative">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" width={1920} height={1080} loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(172_66%_50%/0.08),transparent_60%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Developer Evaluation
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 sm:mb-6 leading-[1.08] tracking-tight">
              Identify the{" "}
              <span className="gradient-text">Top 1%</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>of Developers
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Multi-layered adaptive testing with real-time anti-cheat monitoring,
              AI behavioral analysis, and verified skill certification.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <Button size="lg" onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12">
                Start Testing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/leaderboard')} className="text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12 border-border/40">
                View Leaderboard
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-12 sm:mt-16 flex justify-center">
            <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-10 px-4 border-y border-border/15">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center py-2">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold gradient-text">{s.value}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Enterprise-Grade Testing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              A comprehensive evaluation pipeline that's virtually impossible to cheat
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                <GlowCard>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg gradient-primary flex items-center justify-center mb-3 sm:mb-4">
                    <AnimatedIcon icon={f.icon} size={18} className="text-primary-foreground" variant={f.variant} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 border-t border-border/15">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 sm:mb-16">How It Works</h2>
          <div className="space-y-6 sm:space-y-8">
            {[
              { step: "01", title: "Register & Select Skills", desc: "Create your profile, select your tech stack and proficiency levels." },
              { step: "02", title: "Take Adaptive Tests", desc: "MCQ round adapts to your level, then coding challenges in your selected languages." },
              { step: "03", title: "AI Evaluates Results", desc: "Anti-cheat engine + AI analyzes code originality, typing patterns, and behavior." },
              { step: "04", title: "Get Verified Certificate", desc: "Receive a tamper-proof certificate with QR verification, shareable anywhere." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="flex gap-4 sm:gap-6 items-start">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <GlowCard hoverScale={false} className="glow">
            <div className="text-center py-4 sm:py-6 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Find Elite Developers?</h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
                Join companies that trust Yamikage to identify verified top talent with confidence.
              </p>
              <Button size="lg" onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-sm sm:text-base px-6 sm:px-8 h-11 sm:h-12">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </GlowCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-border/15">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
          <Logo size={24} />
          <span className="text-center">© 2026 Yamikage Dev Tester. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
