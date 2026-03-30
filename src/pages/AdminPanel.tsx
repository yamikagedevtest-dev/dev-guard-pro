import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Users, CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedIcon from "@/components/AnimatedIcon";
import ChipLoader from "@/components/ChipLoader";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: sessionsData } = await supabase.from('test_sessions').select('*').order('created_at', { ascending: false });
      setSessions(sessionsData || []);
      const userIds = [...new Set((sessionsData || []).map(s => s.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase.from('profiles').select('*').in('id', userIds);
        const map = new Map();
        (profilesData || []).forEach(p => map.set(p.id, p));
        setProfiles(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.cheat_status !== filter) return false;
    if (search) {
      const profile = profiles.get(s.user_id);
      if (!profile) return false;
      return profile.full_name?.toLowerCase().includes(search.toLowerCase()) || profile.email?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const styles = {
      clean: 'bg-accent/10 text-accent border-accent/20',
      suspicious: 'bg-warning/10 text-warning border-warning/20',
      cheated: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge variant="outline" className={`text-xs ${styles[status as keyof typeof styles] || ''}`}>{status}</Badge>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><ChipLoader text="Loading" /></div>;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Logo size={36} />
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage candidates and review results</p>
            </div>
          </div>
          <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Tests', value: sessions.length, color: 'gradient-primary', variant: 'bounce' as const },
            { icon: CheckCircle, label: 'Clean', value: sessions.filter(s => s.cheat_status === 'clean').length, color: 'gradient-accent', variant: 'pulse' as const },
            { icon: AlertTriangle, label: 'Suspicious', value: sessions.filter(s => s.cheat_status === 'suspicious').length, color: 'bg-warning/20', variant: 'float' as const },
            { icon: XCircle, label: 'Cheated', value: sessions.filter(s => s.cheat_status === 'cheated').length, color: 'bg-destructive/20', variant: 'pulse' as const },
          ].map((s, i) => (
            <Card key={i} className="glass card-hover">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                    <AnimatedIcon icon={s.icon} size={20} className="text-primary-foreground" variant={s.variant} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass mb-6">
          <CardContent className="pt-4 pb-4 flex items-center gap-4 flex-wrap">
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="cheated">Cheated</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs">Candidate</TableHead>
                <TableHead className="text-xs">Score</TableHead>
                <TableHead className="text-xs">Trust</TableHead>
                <TableHead className="text-xs">Cheat %</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const profile = profiles.get(s.user_id);
                return (
                  <TableRow key={s.id} className="border-border/20 hover:bg-secondary/10">
                    <TableCell>
                      <div className="font-medium text-sm">{profile?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{profile?.email}</div>
                    </TableCell>
                    <TableCell className="font-bold text-sm">{Math.round(Number(s.total_score || 0))}%</TableCell>
                    <TableCell>
                      <span className={`font-medium text-sm ${Number(s.trust_score) >= 70 ? 'text-accent' : Number(s.trust_score) >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {Math.round(Number(s.trust_score || 0))}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{Math.round(Number(s.cheat_probability || 0))}%</TableCell>
                    <TableCell>{statusBadge(s.cheat_status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/candidate/${s.id}`)} className="gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
