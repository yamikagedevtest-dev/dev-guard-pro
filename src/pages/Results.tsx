import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Shield, AlertTriangle, ArrowLeft } from "lucide-react";

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    Promise.all([
      supabase.from('test_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('test_answers').select('*').eq('session_id', sessionId),
      supabase.from('violations').select('*').eq('session_id', sessionId),
    ]).then(([sessionRes, answersRes, violationsRes]) => {
      setSession(sessionRes.data);
      setAnswers(answersRes.data || []);
      setViolations(violationsRes.data || []);
      setLoading(false);
    });
  }, [sessionId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const mcqAnswers = answers.filter(a => a.question_type === 'mcq');
  const codingAnswers = answers.filter(a => a.question_type === 'coding');
  const mcqCorrect = mcqAnswers.filter(a => a.is_correct).length;
  const statusColor = session?.cheat_status === 'clean' ? 'text-accent' : session?.cheat_status === 'suspicious' ? 'text-yellow-500' : 'text-destructive';

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Test Results</h1>
          <p className="text-muted-foreground">
            Completed {session?.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-primary">{Math.round(Number(session?.total_score || 0))}%</div>
              <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-accent">{Math.round(Number(session?.trust_score || 0))}</div>
              <p className="text-sm text-muted-foreground mt-1">Trust Score</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="pt-6">
              <div className={`text-4xl font-bold ${statusColor}`}>
                {session?.cheat_status?.toUpperCase() || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Status</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> MCQ Round</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Questions</span><span>{mcqAnswers.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="text-accent">{mcqCorrect}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span>{mcqAnswers.length > 0 ? Math.round((mcqCorrect / mcqAnswers.length) * 100) : 0}%</span></div>
                <Progress value={mcqAnswers.length > 0 ? (mcqCorrect / mcqAnswers.length) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Coding Round</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Challenges</span><span>{codingAnswers.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span className="text-accent">{codingAnswers.filter(a => a.code_submission).length}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {violations.length > 0 && (
          <Card className="glass border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" /> Violations ({violations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {violations.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-destructive/10">
                    <span>{v.violation_type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{new Date(v.created_at).toLocaleTimeString()}</span>
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
