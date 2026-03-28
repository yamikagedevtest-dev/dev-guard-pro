import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Shield, AlertTriangle, ArrowLeft, Download, Award, CheckCircle, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      const [sessionRes, answersRes, violationsRes] = await Promise.all([
        supabase.from('test_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('test_answers').select('*').eq('session_id', sessionId),
        supabase.from('violations').select('*').eq('session_id', sessionId),
      ]);
      setSession(sessionRes.data);
      setAnswers(answersRes.data || []);
      setViolations((violationsRes.data || []).filter((v: any) => v.violation_type !== 'editor_events'));

      if (sessionRes.data?.user_id) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', sessionRes.data.user_id).single();
        setProfile(profileData);
        const { data: certData } = await supabase.from('certificates').select('*').eq('session_id', sessionId).maybeSingle();
        setCertificate(certData);
      }

      // Trigger cheat analysis
      if (sessionRes.data?.status === 'completed' && !sessionRes.data?.ai_verdict) {
        const codingAnswers = (answersRes.data || []).filter((a: any) => a.question_type === 'coding');
        if (codingAnswers.length > 0) {
          try {
            const { data: analysisData } = await supabase.functions.invoke('cheat-analysis', {
              body: {
                code: codingAnswers.map((a: any) => a.code_submission).join('\n---\n'),
                violations: (violationsRes.data || []).filter((v: any) => v.violation_type !== 'editor_events'),
                timeData: { totalTime: codingAnswers.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0) },
              },
            });
            if (analysisData && !analysisData.error) {
              await supabase.from('test_sessions').update({ ai_verdict: analysisData }).eq('id', sessionId);
            }
          } catch (e) { console.error('Cheat analysis failed:', e); }
        }
      }

      setLoading(false);
    };
    load();
  }, [sessionId]);

  const generateCertificate = async () => {
    if (!session || !profile) return;
    setGenerating(true);
    const certId = `YDT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { data: skills } = await supabase.from('user_skills').select('skill_name').eq('user_id', session.user_id);
    const { data: cert, error } = await supabase.from('certificates').insert({
      session_id: session.id, user_id: session.user_id, certificate_id: certId,
      final_score: Number(session.total_score || 0), trust_score: Number(session.trust_score || 0),
      skills: (skills || []).map(s => s.skill_name),
    }).select().single();
    if (error) toast({ title: "Error", description: "Could not generate certificate.", variant: "destructive" });
    else { setCertificate(cert); toast({ title: "Certificate Generated!", description: `ID: ${certId}` }); }
    setGenerating(false);
  };

  const downloadCertificate = () => {
    if (!certificate || !profile) return;
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificate_id}`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificate - ${profile.full_name}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#0a0b12;color:#e4e6ef;display:flex;align-items:center;justify-content:center;min-height:100vh}
.cert{width:900px;padding:64px;border:1px solid rgba(124,93,250,0.3);border-radius:24px;background:linear-gradient(145deg,#12141f 0%,#0a0b12 50%,#0f1120 100%);position:relative;overflow:hidden}
.cert::before{content:'';position:absolute;top:-40%;left:-40%;width:180%;height:180%;background:radial-gradient(circle at 30% 30%,rgba(124,93,250,0.04) 0%,transparent 60%)}
.header{text-align:center;margin-bottom:48px;position:relative}.logo{font-size:14px;color:rgba(124,93,250,0.7);font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px}
.title{font-size:28px;font-weight:800;background:linear-gradient(135deg,#7c5dfa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.subtitle{font-size:13px;color:#6b7280;margin-top:8px}.name{text-align:center;font-size:44px;font-weight:800;margin:32px 0;color:#fff;letter-spacing:-0.5px}
.scores{display:flex;justify-content:center;gap:56px;margin:36px 0}.score-item{text-align:center}
.score-val{font-size:40px;font-weight:800;background:linear-gradient(135deg,#7c5dfa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.score-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.skills{text-align:center;margin:24px 0}.skill-badge{display:inline-block;padding:5px 14px;border:1px solid rgba(124,93,250,0.2);border-radius:20px;margin:4px;font-size:12px;color:#a78bfa}
.footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:48px;border-top:1px solid rgba(255,255,255,0.06);padding-top:24px}
.footer-left{font-size:12px;color:#6b7280;line-height:1.8}.cert-id{font-family:'JetBrains Mono',monospace;color:#7c5dfa}
.divider{width:80px;height:2px;background:linear-gradient(90deg,#7c5dfa,transparent);margin:0 auto 32px}
</style></head><body><div class="cert"><div class="header"><div class="logo">⚡ Yamikage Dev Tester</div>
<div class="title">Certificate of Technical Excellence</div><div class="subtitle">This certifies that the following developer has demonstrated exceptional skills</div></div>
<div class="divider"></div><div class="name">${profile.full_name}</div>
<div class="scores"><div class="score-item"><div class="score-val">${Math.round(certificate.final_score)}%</div><div class="score-label">Final Score</div></div>
<div class="score-item"><div class="score-val">${Math.round(certificate.trust_score)}</div><div class="score-label">Trust Score</div></div>
${certificate.rank ? `<div class="score-item"><div class="score-val">#${certificate.rank}</div><div class="score-label">Rank</div></div>` : ''}</div>
${(certificate.skills || []).length > 0 ? `<div class="skills">${(certificate.skills || []).map((s: string) => `<span class="skill-badge">${s}</span>`).join('')}</div>` : ''}
<div class="footer"><div class="footer-left"><div>Certificate ID: <span class="cert-id">${certificate.certificate_id}</span></div>
<div>Issued: ${new Date(certificate.issued_at).toLocaleDateString()}</div><div>Verify: ${verifyUrl}</div></div></div></div>
<script>window.print();</script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const mcqAnswers = answers.filter(a => a.question_type === 'mcq');
  const codingAnswers = answers.filter(a => a.question_type === 'coding');
  const mcqCorrect = mcqAnswers.filter(a => a.is_correct).length;
  const score = Number(session?.total_score || 0);
  const trust = Number(session?.trust_score || 0);
  const statusColor = session?.cheat_status === 'clean' ? 'text-accent' : session?.cheat_status === 'suspicious' ? 'text-warning' : 'text-destructive';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
          <Logo size={28} />
        </div>

        {/* Hero Score */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-4">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Test Results</h1>
          <p className="text-muted-foreground text-sm">
            Completed {session?.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="glass text-center card-hover">
            <CardContent className="pt-6 pb-4">
              <div className="text-4xl font-extrabold gradient-text">{Math.round(score)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Score</p>
            </CardContent>
          </Card>
          <Card className="glass text-center card-hover">
            <CardContent className="pt-6 pb-4">
              <div className="text-4xl font-extrabold text-accent">{Math.round(trust)}</div>
              <p className="text-xs text-muted-foreground mt-1">Trust Score</p>
            </CardContent>
          </Card>
          <Card className="glass text-center card-hover">
            <CardContent className="pt-6 pb-4">
              <div className={`text-2xl font-bold ${statusColor}`}>{session?.cheat_status?.toUpperCase()}</div>
              <p className="text-xs text-muted-foreground mt-1">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Round Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"><Shield className="w-4 h-4 text-primary-foreground" /></div>
                MCQ Round
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Questions</span><span className="font-medium">{mcqAnswers.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="font-medium text-accent">{mcqCorrect}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-medium">{mcqAnswers.length > 0 ? Math.round((mcqCorrect / mcqAnswers.length) * 100) : 0}%</span></div>
              <Progress value={mcqAnswers.length > 0 ? (mcqCorrect / mcqAnswers.length) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center"><Code className="w-4 h-4 text-accent-foreground" /></div>
                Coding Round
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Challenges</span><span className="font-medium">{codingAnswers.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="font-medium text-accent">{codingAnswers.filter(a => a.code_submission).length}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* AI Verdict */}
        {session?.ai_verdict && (
          <Card className="glass mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">🤖 AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <div className="text-lg font-bold">{(session.ai_verdict as any).humanLikelihood || 0}%</div>
                  <p className="text-xs text-muted-foreground">Human Likelihood</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <div className="text-lg font-bold">{(session.ai_verdict as any).aiGeneratedProbability || 0}%</div>
                  <p className="text-xs text-muted-foreground">AI Generated</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <div className="text-lg font-bold">{(session.ai_verdict as any).copiedProbability || 0}%</div>
                  <p className="text-xs text-muted-foreground">Copied</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <div className={`text-lg font-bold ${(session.ai_verdict as any).finalVerdict === 'CLEAN' ? 'text-accent' : (session.ai_verdict as any).finalVerdict === 'SUSPICIOUS' ? 'text-warning' : 'text-destructive'}`}>
                    {(session.ai_verdict as any).finalVerdict}
                  </div>
                  <p className="text-xs text-muted-foreground">Verdict</p>
                </div>
              </div>
              {(session.ai_verdict as any).reasons && (
                <div className="space-y-1 mt-3">
                  {((session.ai_verdict as any).reasons as string[]).map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" /><span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Certificate */}
        <Card className="glass glow mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-sm">
                  <p>Certificate ID: <span className="font-mono text-primary">{certificate.certificate_id}</span></p>
                  <p className="text-muted-foreground">Issued: {new Date(certificate.issued_at).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(certificate.skills || []).map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <Button onClick={downloadCertificate} className="mt-3 gradient-primary text-primary-foreground">
                    <Download className="w-4 h-4 mr-2" /> Download Certificate
                  </Button>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <QRCodeSVG value={`${window.location.origin}/verify/${certificate.certificate_id}`} size={120} level="H" />
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4 text-sm">Generate your verified certificate with QR code</p>
                <Button onClick={generateCertificate} disabled={generating} className="gradient-primary text-primary-foreground">
                  <Award className="w-4 h-4 mr-2" /> {generating ? 'Generating...' : 'Generate Certificate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Violations */}
        {violations.length > 0 && (
          <Card className="glass border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertTriangle className="w-5 h-5" /> Violations ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-destructive/5">
                    <span className="text-sm">{v.violation_type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground text-xs">{new Date(v.created_at).toLocaleTimeString()}</span>
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

const Code = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

export default Results;
