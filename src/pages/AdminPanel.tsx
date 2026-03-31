import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Users, CheckCircle, AlertTriangle, XCircle, Eye, Ban, UserCheck, ShieldOff } from "lucide-react";
import Logo from "@/components/Logo";
import AnimatedIcon from "@/components/AnimatedIcon";
import ChipLoader from "@/components/ChipLoader";
import { useToast } from "@/hooks/use-toast";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; userId: string; name: string; currentlyBlocked: boolean }>({ open: false, userId: "", name: "", currentlyBlocked: false });
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const load = async () => {
      const [sessionsRes, profilesRes] = await Promise.all([
        supabase.from('test_sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      ]);
      setSessions(sessionsRes.data || []);
      setAllProfiles(profilesRes.data || []);
      const map = new Map();
      (profilesRes.data || []).forEach(p => map.set(p.id, p));
      setProfiles(map);
      setLoading(false);
    };
    load();
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filter !== 'all' && s.cheat_status !== filter) return false;
    if (search) {
      const profile = profiles.get(s.user_id);
      if (!profile) return false;
      return profile.full_name?.toLowerCase().includes(search.toLowerCase()) || profile.email?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const filteredUsers = allProfiles.filter(p => {
    if (!userSearch) return true;
    return p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || p.email?.toLowerCase().includes(userSearch.toLowerCase());
  });

  const handleBlockToggle = async () => {
    const newBlocked = !blockDialog.currentlyBlocked;
    await supabase.from('profiles').update({
      is_blocked: newBlocked,
      blocked_reason: newBlocked ? blockReason : null,
    }).eq('id', blockDialog.userId);

    setAllProfiles(prev => prev.map(p =>
      p.id === blockDialog.userId ? { ...p, is_blocked: newBlocked, blocked_reason: newBlocked ? blockReason : null } : p
    ));
    setProfiles(prev => {
      const next = new Map(prev);
      const existing = next.get(blockDialog.userId);
      if (existing) next.set(blockDialog.userId, { ...existing, is_blocked: newBlocked, blocked_reason: newBlocked ? blockReason : null });
      return next;
    });

    toast({ title: newBlocked ? "User Blocked" : "User Unblocked", description: `${blockDialog.name} has been ${newBlocked ? 'blocked' : 'unblocked'}.` });
    setBlockDialog({ open: false, userId: "", name: "", currentlyBlocked: false });
    setBlockReason("");
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      clean: 'bg-accent/10 text-accent border-accent/20',
      suspicious: 'bg-warning/10 text-warning border-warning/20',
      cheated: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge variant="outline" className={`text-xs ${styles[status] || ''}`}>{status}</Badge>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><ChipLoader text="Loading" /></div>;

  const blockedCount = allProfiles.filter(p => p.is_blocked).length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Tests', value: sessions.length, color: 'gradient-primary', variant: 'bounce' as const },
            { icon: CheckCircle, label: 'Clean', value: sessions.filter(s => s.cheat_status === 'clean').length, color: 'gradient-accent', variant: 'pulse' as const },
            { icon: AlertTriangle, label: 'Suspicious', value: sessions.filter(s => s.cheat_status === 'suspicious').length, color: 'bg-warning/20', variant: 'float' as const },
            { icon: XCircle, label: 'Cheated', value: sessions.filter(s => s.cheat_status === 'cheated').length, color: 'bg-destructive/20', variant: 'pulse' as const },
            { icon: Ban, label: 'Blocked', value: blockedCount, color: 'bg-destructive/30', variant: 'pulse' as const },
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

        <Tabs defaultValue="tests" className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="tests" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Test Sessions</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5"><Users className="w-3.5 h-3.5" /> User Management</TabsTrigger>
          </TabsList>

          {/* TEST SESSIONS TAB */}
          <TabsContent value="tests" className="space-y-4">
            <Card className="glass">
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
              <div className="overflow-x-auto">
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
                    {filteredSessions.map(s => {
                      const profile = profiles.get(s.user_id);
                      return (
                        <TableRow key={s.id} className="border-border/20 hover:bg-secondary/10">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium text-sm">{profile?.full_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">{profile?.email}</div>
                              </div>
                              {profile?.is_blocked && <Badge variant="destructive" className="text-[10px] h-5">Blocked</Badge>}
                            </div>
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
                    {filteredSessions.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* USER MANAGEMENT TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card className="glass">
              <CardContent className="pt-4 pb-4 flex items-center gap-4 flex-wrap">
                <Input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="max-w-sm" />
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Location</TableHead>
                      <TableHead className="text-xs">Experience</TableHead>
                      <TableHead className="text-xs">Tests</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Joined</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(p => {
                      const userSessions = sessions.filter(s => s.user_id === p.id);
                      return (
                        <TableRow key={p.id} className="border-border/20 hover:bg-secondary/10">
                          <TableCell>
                            <div className="font-medium text-sm">{p.full_name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{p.email}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.location || '—'}</TableCell>
                          <TableCell className="text-sm">{p.experience_years || 0} yrs</TableCell>
                          <TableCell className="text-sm font-medium">{userSessions.length}</TableCell>
                          <TableCell>
                            {p.is_blocked ? (
                              <Badge variant="destructive" className="text-xs gap-1"><ShieldOff className="w-3 h-3" /> Blocked</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-accent border-accent/20 gap-1"><UserCheck className="w-3 h-3" /> Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant={p.is_blocked ? "outline" : "destructive"}
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => setBlockDialog({ open: true, userId: p.id, name: p.full_name || p.email, currentlyBlocked: p.is_blocked })}
                            >
                              {p.is_blocked ? <><UserCheck className="w-3 h-3" /> Unblock</> : <><Ban className="w-3 h-3" /> Block</>}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredUsers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Block/Unblock Dialog */}
        <Dialog open={blockDialog.open} onOpenChange={(open) => { setBlockDialog(prev => ({ ...prev, open })); setBlockReason(""); }}>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>{blockDialog.currentlyBlocked ? 'Unblock' : 'Block'} {blockDialog.name}?</DialogTitle>
            </DialogHeader>
            {!blockDialog.currentlyBlocked && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Reason (optional)</label>
                <Textarea value={blockReason} onChange={e => setBlockReason(e.target.value)} placeholder="Reason for blocking..." />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBlockDialog({ open: false, userId: "", name: "", currentlyBlocked: false })}>Cancel</Button>
              <Button variant={blockDialog.currentlyBlocked ? "default" : "destructive"} onClick={handleBlockToggle}>
                {blockDialog.currentlyBlocked ? 'Unblock User' : 'Block User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
