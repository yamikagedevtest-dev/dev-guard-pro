import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Brain, Code, Trophy, Zap, Users, ArrowRight, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Code, title: "Multi-Round Testing", desc: "MCQ, coding challenges, and adaptive difficulty that scales with your performance." },
  { icon: Shield, title: "Anti-Cheat Engine", desc: "Real-time monitoring: copy/paste blocking, tab detection, keystroke analysis, behavioral scoring." },
  { icon: Brain, title: "AI Analysis", desc: "Code originality detection, AI-generated code flagging, and behavioral trust scoring." },
  { icon: Trophy, title: "Verified Certificates", desc: "Tamper-proof certificates with QR verification and unique IDs." },
  { icon: Users, title: "Admin Dashboard", desc: "Full candidate analytics, code playback, cheat flagging, and submission review." },
  { icon: Zap, title: "Adaptive Engine", desc: "Questions adjust difficulty in real-time. Easy → Medium → Hard → Expert." },
];

const stats = [
  { value: "99.2%", label: "Cheat Detection Rate" },
  { value: "15+", label: "Languages Supported" },
  { value: "500+", label: "Challenge Pool" },
  { value: "<2s", label: "Judge Response" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-strong border-b border-border/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-sm">Login</Button>
            <Button onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-sm">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_85%_65%/0.08),transparent_60%)]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Developer Evaluation Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              Identify the{" "}
              <span className="gradient-text">Top 1%</span>
              <br />of Developers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Multi-layered adaptive testing with real-time anti-cheat monitoring,
              AI behavioral analysis, and verified skill certification.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button size="lg" onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-base px-8 h-12">
                Start Testing <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/leaderboard')} className="text-base px-8 h-12">
                View Leaderboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 border-y border-border/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Testing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A comprehensive evaluation pipeline that's virtually impossible to cheat
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 card-hover group"
              >
                <div className="w-11 h-11 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border/20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: "01", title: "Register & Select Skills", desc: "Create your profile, select your tech stack and proficiency levels." },
              { step: "02", title: "Take Adaptive Tests", desc: "MCQ round adapts to your level, then coding challenges in your selected languages." },
              { step: "03", title: "AI Evaluates Results", desc: "Anti-cheat engine + AI analyzes code originality, typing patterns, and behavior." },
              { step: "04", title: "Get Verified Certificate", desc: "Receive a tamper-proof certificate with QR verification, shareable anywhere." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="glass rounded-2xl p-12 text-center glow relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(250_85%_65%/0.06),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Elite Developers?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join companies that trust Yamikage to identify verified top talent with confidence.
              </p>
              <Button size="lg" onClick={() => navigate('/register')} className="gradient-primary text-primary-foreground text-base px-8 h-12">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/20">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <Logo size={24} />
          <span>© 2026 Yamikage Dev Tester. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
