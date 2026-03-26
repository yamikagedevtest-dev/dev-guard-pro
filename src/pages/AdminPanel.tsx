import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";

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
      return profile.full_name?.toLowerCase().includes(search.toLowerCase()) ||
             profile.email?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'clean': return <Badge className="bg-accent/20 text-accent border-accent/30">Clean</Badge>;
      case 'suspicious': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Suspicious</Badge>;
      case 'cheated': return <Badge variant="destructive">Cheated</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="w-8 h-8 text-primary" /> Admin Panel</h1>
            <p className="text-muted-foreground">Manage candidates and review test results</p>
          </div>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="glass"><CardContent className="pt-6"><div className="text-2xl font-bold">{sessions.length}</div><p className="text-sm text-muted-foreground">Total Tests</p></CardContent></Card>
          <Card className="glass"><CardContent className="pt-6"><div className="text-2xl font-bold text-accent">{sessions.filter(s => s.cheat_status === 'clean').length}</div><p className="text-sm text-muted-foreground">Clean</p></CardContent></Card>
          <Card className="glass"><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-500">{sessions.filter(s => s.cheat_status === 'suspicious').length}</div><p className="text-sm text-muted-foreground">Suspicious</p></CardContent></Card>
          <Card className="glass"><CardContent className="pt-6"><div className="text-2xl font-bold text-destructive">{sessions.filter(s => s.cheat_status === 'cheated').length}</div><p className="text-sm text-muted-foreground">Cheated</p></CardContent></Card>
        </div>

        <Card className="glass mb-6">
          <CardContent className="pt-6 flex items-center gap-4">
            <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="cheated">Cheated</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="glass">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Cheat %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const profile = profiles.get(s.user_id);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{profile?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{profile?.email}</div>
                    </TableCell>
                    <TableCell className="font-bold">{Math.round(Number(s.total_score || 0))}%</TableCell>
                    <TableCell>
                      <span className={Number(s.trust_score) >= 70 ? 'text-accent' : Number(s.trust_score) >= 40 ? 'text-yellow-500' : 'text-destructive'}>
                        {Math.round(Number(s.trust_score || 0))}
                      </span>
                    </TableCell>
                    <TableCell>{Math.round(Number(s.cheat_probability || 0))}%</TableCell>
                    <TableCell>{statusBadge(s.cheat_status)}</TableCell>
                    <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/results/${s.id}`)}>View</Button>
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
