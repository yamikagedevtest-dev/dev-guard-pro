import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Code, Brain, Trophy, LogOut, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
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

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome, {profile?.full_name || 'Developer'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass">
            <CardContent className="pt-6">
              <Code className="w-8 h-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-sm text-muted-foreground">Tests Taken</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <Brain className="w-8 h-8 text-accent mb-2" />
              <div className="text-2xl font-bold">
                {sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + Number(s.total_score || 0), 0) / sessions.length) : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">
                {sessions.filter(s => Number(s.total_score || 0) >= 70).length}
              </div>
              <p className="text-sm text-muted-foreground">Tests Passed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass neon-glow mb-8">
          <CardHeader>
            <CardTitle>Start a New Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Take a comprehensive developer evaluation with MCQ, coding challenges, and more.
              The test adapts to your skill level in real-time.
            </p>
            <Button onClick={startTest} className="neon-glow">Start Test Now</Button>
          </CardContent>
        </Card>

        {sessions.length > 0 && (
          <Card className="glass">
            <CardHeader><CardTitle>Test History</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => s.status === 'completed' ? navigate(`/results/${s.id}`) : null}
                  >
                    <div>
                      <p className="font-medium">Test Session</p>
                      <p className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Math.round(Number(s.total_score || 0))}%</p>
                      <p className={`text-xs ${s.status === 'completed' ? 'text-accent' : 'text-yellow-500'}`}>
                        {s.status === 'completed' ? 'Completed' : s.status === 'in_progress' ? 'In Progress' : s.status}
                      </p>
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
