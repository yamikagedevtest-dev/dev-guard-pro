import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Code, Brain, Trophy, LogOut, TrendingUp, User, ArrowRight, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import type { User as AuthUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => setProfile(p));
        supabase.from('test_sessions').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false }).then(({ data: s }) => setSessions(s || []));
      }
    });
  }, []);

  const startTest = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('test_sessions').insert({
      user_id: user.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }).select().single();
    if (data && !error) navigate(`/test/mcq/${data.id}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = (profile?.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Logo size={36} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/leaderboard')} className="gap-1.5">
              <TrendingUp className="w-4 h-4" /> Leaderboard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-1.5">
              <Avatar className="w-6 h-6">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{initials}</AvatarFallback>
              </Avatar>
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{profile?.full_name || 'Developer'}</span>
          </h1>
          <p className="text-muted-foreground">Track your progress and take new assessments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass card-hover">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <Code className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <p className="text-xs text-muted-foreground">Tests Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                  <Brain className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + Number(s.total_score || 0), 0) / sessions.length) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass card-hover">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{sessions.filter(s => Number(s.total_score || 0) >= 70).length}</div>
                  <p className="text-xs text-muted-foreground">Tests Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Test CTA */}
        <Card className="glass glow mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,hsl(250_85%_65%/0.06),transparent_60%)]" />
          <CardContent className="py-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Ready for your next challenge?</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Take a comprehensive developer evaluation with MCQ, coding challenges, and real-time adaptive difficulty.
                </p>
              </div>
              <Button onClick={startTest} className="gradient-primary text-primary-foreground px-6 h-11 flex-shrink-0">
                Start New Test <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test History */}
        {sessions.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Test History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors group"
                    onClick={() => s.status === 'completed' ? navigate(`/results/${s.id}`) : null}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.status === 'completed' ? 'bg-accent' : 'bg-warning animate-pulse'}`} />
                      <div>
                        <p className="font-medium text-sm">Test Session</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-sm">{Math.round(Number(s.total_score || 0))}%</p>
                        <Badge variant="outline" className={`text-[10px] ${s.status === 'completed' ? 'border-accent/30 text-accent' : 'border-warning/30 text-warning'}`}>
                          {s.status === 'completed' ? 'Completed' : s.status === 'in_progress' ? 'In Progress' : s.status}
                        </Badge>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
