import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, AlertTriangle, Code, Trophy, User } from "lucide-react";
import CodePlayback from "@/components/CodePlayback";
import Editor from "@monaco-editor/react";

const AdminCandidateDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const [sessionRes, answersRes, violationsRes] = await Promise.all([
        supabase.from('test_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('test_answers').select('*').eq('session_id', sessionId),
        supabase.from('violations').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
      ]);

      setSession(sessionRes.data);
      setAnswers(answersRes.data || []);
      setViolations(violationsRes.data || []);

      if (sessionRes.data?.user_id) {
        const [profileRes, skillsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', sessionRes.data.user_id).single(),
          supabase.from('user_skills').select('*').eq('user_id', sessionRes.data.user_id),
        ]);
        setProfile(profileRes.data);
        setSkills(skillsRes.data || []);
      }
      setLoading(false);
    };
    load();
  }, [sessionId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const codingAnswers = answers.filter(a => a.question_type === 'coding');
  const mcqAnswers = answers.filter(a => a.question_type === 'mcq');
  const editorEvents = violations.filter(v => v.violation_type === 'editor_events');
  const realViolations = violations.filter(v => v.violation_type !== 'editor_events');

  // Flatten editor events for playback
  const allEditorEvents = editorEvents.flatMap(v => {
    const details = v.details as any;
    return details?.events || [];
  });

  const statusColor = session?.cheat_status === 'clean' ? 'text-accent' : session?.cheat_status === 'suspicious' ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
        </Button>

        {/* Candidate Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.full_name || 'Unknown'}</h1>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {profile?.location && <Badge variant="outline">{profile.location}</Badge>}
                {profile?.experience_years != null && <Badge variant="outline">{profile.experience_years} yrs exp</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{Math.round(Number(session?.total_score || 0))}%</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{Math.round(Number(session?.trust_score || 0))}</div>
              <p className="text-xs text-muted-foreground">Trust</p>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${statusColor}`}>{session?.cheat_status?.toUpperCase()}</div>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {skills.map(s => (
              <Badge key={s.id} variant="outline" className="text-xs">
                {s.skill_name} <span className="ml-1 text-muted-foreground">({s.skill_level})</span>
              </Badge>
            ))}
          </div>
        )}

        <Tabs defaultValue="code" className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="code"><Code className="w-4 h-4 mr-1" /> Code Submissions</TabsTrigger>
            <TabsTrigger value="playback">🎥 Playback</TabsTrigger>
            <TabsTrigger value="violations"><AlertTriangle className="w-4 h-4 mr-1" /> Violations</TabsTrigger>
            <TabsTrigger value="mcq"><Shield className="w-4 h-4 mr-1" /> MCQ Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            {codingAnswers.length === 0 ? (
              <Card className="glass"><CardContent className="pt-6 text-center text-muted-foreground">No coding submissions</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {codingAnswers.map((a, i) => (
                  <Card key={a.id} className="glass">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Submission {i + 1}</span>
                        <span className="text-sm text-muted-foreground">{a.time_spent_seconds}s spent</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg overflow-hidden border border-border h-[300px]">
                        <Editor
                          height="100%"
                          language="javascript"
                          value={a.code_submission || '// No code submitted'}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            fontSize: 13,
                            minimap: { enabled: false },
                            fontFamily: "'JetBrains Mono', monospace",
                            scrollBeyondLastLine: false,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playback">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🎥 Code Playback</CardTitle>
              </CardHeader>
              <CardContent>
                {allEditorEvents.length > 0 ? (
                  <CodePlayback
                    events={allEditorEvents}
                    finalCode={codingAnswers[0]?.code_submission || ''}
                    language="javascript"
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">No editor events recorded</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" /> Violations ({realViolations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realViolations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No violations 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {realViolations.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={v.severity === 'high' ? 'destructive' : 'outline'} className="text-xs">
                            {v.severity}
                          </Badge>
                          <span>{v.violation_type.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-muted-foreground">{new Date(v.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mcq">
            <Card className="glass">
              <CardHeader><CardTitle>MCQ Answers ({mcqAnswers.length})</CardTitle></CardHeader>
              <CardContent>
                {mcqAnswers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No MCQ answers</p>
                ) : (
                  <div className="space-y-2">
                    {mcqAnswers.map((a, i) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 text-sm">
                        <span>Q{i + 1}: Answer {a.user_answer}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{a.time_spent_seconds}s</span>
                          <Badge variant={a.is_correct ? 'default' : 'destructive'} className="text-xs">
                            {a.is_correct ? '✓ Correct' : '✗ Wrong'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCandidateDetail;