import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Brain, Code, Trophy, Zap, Users } from "lucide-react";
import Logo from "@/components/Logo";

const features = [
  { icon: Code, title: "Multi-Round Testing", desc: "MCQ, coding challenges, debugging, and system design rounds with adaptive difficulty." },
  { icon: Shield, title: "Anti-Cheat Engine", desc: "Real-time copy/paste blocking, tab detection, keystroke analysis, and behavioral monitoring." },
  { icon: Brain, title: "AI Analysis", desc: "Deep code review for originality, AI-generated code detection, and behavioral trust scoring." },
  { icon: Trophy, title: "Verified Certificates", desc: "Tamper-proof certificates with QR verification and unique IDs." },
  { icon: Users, title: "Admin Dashboard", desc: "Full candidate analytics, cheat flagging, and code submission review." },
  { icon: Zap, title: "Adaptive Engine", desc: "Questions adjust difficulty based on performance. Easy → Medium → Hard → Expert." },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/30">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={32} />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')} className="neon-glow">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(185_100%_42%/0.08),transparent_70%)]" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI-Powered Developer Evaluation
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find the <span className="text-primary neon-text">Top 1%</span><br />
              of Developers
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Multi-layered adaptive testing with real-time anti-cheat monitoring
              and AI-powered behavioral analysis. No more fake developers.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register')} className="neon-glow text-base px-8">
                Start Testing
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-base px-8">
                Admin Login
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            A comprehensive evaluation pipeline that's nearly impossible to cheat
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 hover:neon-glow transition-shadow duration-500"
              >
                <f.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="glass rounded-2xl p-12 text-center neon-glow">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Elite Developers?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join companies that trust Yamikage to identify top talent with confidence.
            </p>
            <Button size="lg" onClick={() => navigate('/register')} className="neon-glow text-base px-8">
              Get Started Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 Yamikage Dev Tester</span>
          <span>Built with precision</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
