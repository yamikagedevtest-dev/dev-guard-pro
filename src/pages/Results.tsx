import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Shield, AlertTriangle, ArrowLeft, Download, Award } from "lucide-react";
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
      session_id: session.id,
      user_id: session.user_id,
      certificate_id: certId,
      final_score: Number(session.total_score || 0),
      trust_score: Number(session.trust_score || 0),
      skills: (skills || []).map(s => s.skill_name),
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "Could not generate certificate. You may need admin privileges.", variant: "destructive" });
    } else {
      setCertificate(cert);
      toast({ title: "Certificate Generated!", description: `ID: ${certId}` });
    }
    setGenerating(false);
  };

  const downloadCertificate = () => {
    if (!certificate || !profile) return;
    // Generate a printable HTML certificate and trigger print/download
    const verifyUrl = `${window.location.origin}/verify/${certificate.certificate_id}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate - ${profile.full_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Space Grotesk', sans-serif; background: #0a0e1a; color: #e8eaf0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cert { width: 900px; padding: 60px; border: 3px solid #00b8d4; border-radius: 20px; background: linear-gradient(145deg, #0f1525 0%, #0a0e1a 50%, #0d1520 100%); position: relative; overflow: hidden; }
    .cert::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at 30% 30%, rgba(0,184,212,0.05) 0%, transparent 60%); }
    .header { text-align: center; margin-bottom: 40px; position: relative; }
    .logo { font-size: 18px; color: #00b8d4; font-weight: 700; letter-spacing: 2px; margin-bottom: 10px; }
    .title { font-size: 32px; font-weight: 700; color: #00b8d4; text-shadow: 0 0 20px rgba(0,184,212,0.3); }
    .subtitle { font-size: 14px; color: #8892a6; margin-top: 5px; }
    .name { text-align: center; font-size: 42px; font-weight: 700; margin: 30px 0; color: #fff; }
    .scores { display: flex; justify-content: center; gap: 50px; margin: 30px 0; }
    .score-item { text-align: center; }
    .score-val { font-size: 36px; font-weight: 700; color: #00b8d4; }
    .score-label { font-size: 12px; color: #8892a6; text-transform: uppercase; letter-spacing: 1px; }
    .skills { text-align: center; margin: 20px 0; }
    .skill-badge { display: inline-block; padding: 4px 12px; border: 1px solid rgba(0,184,212,0.3); border-radius: 20px; margin: 4px; font-size: 12px; color: #00b8d4; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer-left { font-size: 12px; color: #8892a6; }
    .cert-id { font-family: monospace; color: #00b8d4; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">
      <div class="logo">⚡ YAMIKAGE DEV TESTER</div>
      <div class="title">Certificate of Technical Excellence</div>
      <div class="subtitle">This certifies that the following developer has demonstrated exceptional skills</div>
    </div>
    <div class="name">${profile.full_name}</div>
    <div class="scores">
      <div class="score-item">
        <div class="score-val">${Math.round(certificate.final_score)}%</div>
        <div class="score-label">Final Score</div>
      </div>
      <div class="score-item">
        <div class="score-val">${Math.round(certificate.trust_score)}</div>
        <div class="score-label">Trust Score</div>
      </div>
      ${certificate.rank ? `<div class="score-item"><div class="score-val">#${certificate.rank}</div><div class="score-label">Rank</div></div>` : ''}
    </div>
    ${(certificate.skills || []).length > 0 ? `
    <div class="skills">
      ${(certificate.skills || []).map((s: string) => `<span class="skill-badge">${s}</span>`).join('')}
    </div>` : ''}
    <div class="footer">
      <div class="footer-left">
        <div>Certificate ID: <span class="cert-id">${certificate.certificate_id}</span></div>
        <div>Issued: ${new Date(certificate.issued_at).toLocaleDateString()}</div>
        <div>Verify: ${verifyUrl}</div>
      </div>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) win.focus();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const mcqAnswers = answers.filter(a => a.question_type === 'mcq');
  const codingAnswers = answers.filter(a => a.question_type === 'coding');
  const mcqCorrect = mcqAnswers.filter(a => a.is_correct).length;
  const statusColor = session?.cheat_status === 'clean' ? 'text-accent' : session?.cheat_status === 'suspicious' ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Logo size={28} />
        </div>

        <div className="text-center mb-8">
          <Trophy className="w-14 h-14 text-primary mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Test Results</h1>
          <p className="text-muted-foreground">
            Completed {session?.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl md:text-4xl font-bold text-primary">{Math.round(Number(session?.total_score || 0))}%</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Score</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl md:text-4xl font-bold text-accent">{Math.round(Number(session?.trust_score || 0))}</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Trust</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className={`text-xl md:text-2xl font-bold ${statusColor}`}>
                {session?.cheat_status?.toUpperCase() || 'N/A'}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Status</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="w-5 h-5" /> MCQ Round</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Questions</span><span>{mcqAnswers.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="text-accent">{mcqCorrect}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span>{mcqAnswers.length > 0 ? Math.round((mcqCorrect / mcqAnswers.length) * 100) : 0}%</span></div>
                <Progress value={mcqAnswers.length > 0 ? (mcqCorrect / mcqAnswers.length) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="w-5 h-5" /> Coding Round</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Challenges</span><span>{codingAnswers.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="text-accent">{codingAnswers.filter(a => a.code_submission).length}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Section */}
        <Card className="glass neon-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-sm">
                  <p>Certificate ID: <span className="font-mono text-primary">{certificate.certificate_id}</span></p>
                  <p>Issued: {new Date(certificate.issued_at).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(certificate.skills || []).map((s: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <Button onClick={downloadCertificate} className="mt-3 neon-glow">
                    <Download className="w-4 h-4 mr-2" /> Download Certificate
                  </Button>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${certificate.certificate_id}`}
                    size={120}
                    level="H"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Generate your verified certificate with QR code</p>
                <Button onClick={generateCertificate} disabled={generating} className="neon-glow">
                  <Award className="w-4 h-4 mr-2" /> {generating ? 'Generating...' : 'Generate Certificate'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {violations.length > 0 && (
          <Card className="glass border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertTriangle className="w-5 h-5" /> Violations ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-destructive/10">
                    <span>{v.violation_type.replace(/_/g, ' ')}</span>
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

export default Results;