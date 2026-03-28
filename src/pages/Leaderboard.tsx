import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Trophy, Medal, ArrowLeft, Shield, TrendingUp } from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: sessions } = await supabase.from('test_sessions').select('*').eq('status', 'completed').order('total_score', { ascending: false }).limit(50);
      if (!sessions || sessions.length === 0) { setLoading(false); return; }
      const userIds = [...new Set(sessions.map(s => s.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const bestByUser = new Map<string, any>();
      for (const s of sessions) {
        const existing = bestByUser.get(s.user_id);
        if (!existing || Number(s.total_score) > Number(existing.total_score)) bestByUser.set(s.user_id, s);
      }

      const ranked = Array.from(bestByUser.values())
        .sort((a, b) => { const d = Number(b.total_score) - Number(a.total_score); return d !== 0 ? d : Number(b.trust_score) - Number(a.trust_score); })
        .map((s, i) => ({ ...s, rank: i + 1, profile: profileMap.get(s.user_id) }));

      setEntries(ranked);
      setLoading(false);
    };
    load();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Logo size={36} />
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/20 mb-4">
            <Trophy className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top developers ranked by score & trust</p>
        </div>

        {/* Top 3 */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[entries[1], entries[0], entries[2]].map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                <Card className={`glass text-center ${i === 1 ? 'glow scale-105 border-primary/30' : ''}`}>
                  <CardContent className="pt-6 pb-4">
                    {getRankIcon(e.rank)}
                    <p className="font-bold mt-2 truncate text-sm">{e.profile?.full_name || 'Anonymous'}</p>
                    <p className="text-2xl font-extrabold gradient-text">{Math.round(Number(e.total_score))}%</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" /> {Math.round(Number(e.trust_score))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5 text-primary" /> Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {entries.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                  <div className="w-8 flex-shrink-0">{getRankIcon(e.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.profile?.full_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{e.profile?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm gradient-text">{Math.round(Number(e.total_score))}%</p>
                  </div>
                  <div className="flex items-center gap-1 w-14 justify-end">
                    <Shield className="w-3 h-3 text-muted-foreground" />
                    <span className={`text-xs ${Number(e.trust_score) >= 70 ? 'text-accent' : Number(e.trust_score) >= 40 ? 'text-warning' : 'text-destructive'}`}>
                      {Math.round(Number(e.trust_score))}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${e.cheat_status === 'clean' ? 'border-accent/30 text-accent' : e.cheat_status === 'suspicious' ? 'border-warning/30 text-warning' : 'border-destructive/30 text-destructive'}`}>
                    {e.cheat_status}
                  </Badge>
                </motion.div>
              ))}
              {entries.length === 0 && <p className="text-center text-muted-foreground py-8">No completed tests yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
