import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { SKILL_CATEGORIES, type SelectedSkill, type SkillLevel } from "@/lib/skills-data";
import { motion, AnimatePresence } from "framer-motion";

const LEVELS: SkillLevel[] = ["beginner", "intermediate", "expert"];

const Register = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

  const toggleSkill = (name: string, category: string) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.name === name);
      if (exists) return prev.filter(s => s.name !== name);
      return [...prev, { name, category, level: "intermediate" }];
    });
  };

  const setSkillLevel = (name: string, level: SkillLevel) => {
    setSelectedSkills(prev => prev.map(s => s.name === name ? { ...s, level } : s));
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setLoading(false); return; }

    if (data.user) {
      await supabase.from('profiles').update({
        full_name: fullName, phone, location, experience_years: parseInt(experience) || 0,
        github_url: github, portfolio_url: portfolio,
      }).eq('id', data.user.id);

      if (selectedSkills.length > 0) {
        await supabase.from('user_skills').insert(
          selectedSkills.map(s => ({ user_id: data.user!.id, skill_name: s.name, skill_category: s.category, skill_level: s.level }))
        );
      }
      toast({ title: "Welcome!", description: "Account created successfully" });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const steps = ["Account", "Professional", "Skills"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_85%_65%/0.06),transparent_50%)]" />
      <Card className="w-full max-w-2xl glass glow relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6"><Logo size={40} /></div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length}: {steps[step]}</CardDescription>
          <div className="flex items-center gap-2 justify-center mt-4">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'gradient-primary w-12' : 'bg-muted w-8'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {step === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Full Name *</label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Email *</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Password *</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Location</label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Years of Experience</label><Input type="number" value={experience} onChange={e => setExperience(e.target.value)} /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">GitHub URL</label><Input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." /></div>
                  <div className="space-y-1.5"><label className="text-sm text-muted-foreground">Portfolio URL</label><Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." /></div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => {
                          const selected = selectedSkills.find(s => s.name === skill);
                          return (
                            <div key={skill} className="flex items-center gap-1">
                              <Badge
                                variant={selected ? "default" : "outline"}
                                className={`cursor-pointer transition-all text-xs ${selected ? 'gradient-primary text-primary-foreground border-0' : 'hover:border-primary/40'}`}
                                onClick={() => toggleSkill(skill, category)}
                              >
                                {selected && <Check className="w-3 h-3 mr-1" />}{skill}
                              </Badge>
                              {selected && (
                                <select value={selected.level} onChange={e => setSkillLevel(skill, e.target.value as SkillLevel)}
                                  className="text-xs bg-secondary border border-border rounded px-1.5 py-0.5 text-foreground">
                                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="gradient-primary text-primary-foreground">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleRegister} disabled={loading} className="gradient-primary text-primary-foreground">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
