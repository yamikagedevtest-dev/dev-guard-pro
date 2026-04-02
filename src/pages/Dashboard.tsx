import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Code, Brain, Trophy, LogOut, TrendingUp, ArrowRight, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedIcon from "@/components/AnimatedIcon";
import ChipLoader from "@/components/ChipLoader";
import GlowCard from "@/components/GlowCard";
import type { User as AuthUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        Promise.all([
          supabase.from('profiles').select('*').eq('id', data.user.id).single(),
          supabase.from('test_sessions').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        ]).then(([profileRes, sessionsRes]) => {
          setProfile(profileRes.data);
          setSessions(sessionsRes.data || []);
          setLoading(false);
        });
      }
    });
  }, []);

  const startTest = async () => {
    if (!user) return;
    if (profile?.is_blocked) {
      toast({ title: "Account Blocked", description: profile.blocked_reason || "Your account has been blocked by an admin.", variant: "destructive" });
      return;
    }

    // Rate limit: max 3 tests per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = sessions.filter(s => new Date(s.created_at) >= todayStart);
    if (todaySessions.length >= 3) {
      toast({ title: "Daily Limit Reached", description: "You can only take 3 tests per day. Please try again tomorrow.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.from('test_sessions').insert({
      user_id: user.id, status: 'in_progress', started_at: new Date().toISOString(),
    }).select().single();
    if (data && !error) navigate(`/test/mcq/${data.id}`);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); navigate('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><ChipLoader text="Loading" /></div>;

  const initials = (profile?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTests = sessions.filter(s => new Date(s.created_at) >= todayStart).length;
  const testsRemaining = Math.max(0, 3 - todayTests);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <Logo size={32} />
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate('/leaderboard')} className="gap-1.5 text-xs sm:text-sm">
              <AnimatedIcon icon={TrendingUp} size={14} variant="bounce" /> Leaderboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-1.5 text-xs sm:text-sm">
              <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[9px] sm:text-[10px] bg-primary/20 text-primary">{initials}</AvatarFallback>
              </Avatar>
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground text-xs sm:text-sm">
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{profile?.full_name || 'Developer'}</span>
          </h1>
          <p className="text-muted-foreground text-sm">Track your progress and take new assessments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Code, label: 'Tests Taken', value: sessions.length, color: 'gradient-primary', variant: 'bounce' as const },
            { icon: Brain, label: 'Avg Score', value: `${sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + Number(s.total_score || 0), 0) / sessions.length) : 0}%`, color: 'gradient-accent', variant: 'glow' as const },
            { icon: Trophy, label: 'Tests Passed', value: sessions.filter(s => Number(s.total_score || 0) >= 70).length, color: 'bg-warning/20', variant: 'float' as const },
          ].map((s, i) => (
            <Card key={i} className="glass card-hover">
              <CardContent className="pt-5 sm:pt-6 pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                    <AnimatedIcon icon={s.icon} size={18} className="text-primary-foreground" variant={s.variant} />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <GlowCard hoverScale={false} className="mb-6 sm:mb-8 glow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Ready for your next challenge?</h2>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
                Take a comprehensive developer evaluation with MCQ, coding challenges, and real-time adaptive difficulty.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < todayTests ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${testsRemaining === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {testsRemaining === 0 ? 'Daily limit reached' : `${testsRemaining} test${testsRemaining !== 1 ? 's' : ''} remaining today`}
                </span>
              </div>
            </div>
            <Button onClick={startTest} disabled={testsRemaining === 0} className="gradient-primary text-primary-foreground px-5 sm:px-6 h-10 sm:h-11 flex-shrink-0 w-full sm:w-auto text-sm disabled:opacity-50">
              Start New Test <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </GlowCard>

        {sessions.length > 0 && (
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <AnimatedIcon icon={Clock} size={18} className="text-primary" variant="pulse" /> Test History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 sm:p-3.5 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors group"
                    onClick={() => s.status === 'completed' ? navigate(`/results/${s.id}`) : null}>
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === 'completed' ? 'bg-primary' : 'bg-warning animate-pulse'}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">Test Session</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-xs sm:text-sm">{Math.round(Number(s.total_score || 0))}%</p>
                        <Badge variant="outline" className={`text-[9px] sm:text-[10px] ${s.status === 'completed' ? 'border-primary/30 text-primary' : 'border-warning/30 text-warning'}`}>
                          {s.status === 'completed' ? 'Completed' : s.status === 'in_progress' ? 'In Progress' : s.status}
                        </Badge>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
