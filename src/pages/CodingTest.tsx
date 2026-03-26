import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { Timer, AlertTriangle, Play, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@supabase/supabase-js";

const CodingTest = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(true);

  const finishTest = useCallback(async () => {
    if (!sessionId) return;
    const { data: allAnswers } = await supabase.from('test_answers').select('*').eq('session_id', sessionId);
    const totalScore = (allAnswers || []).reduce((sum, a) => sum + Number(a.score || 0), 0);
    const maxScore = (allAnswers || []).length * 10;
    const percentage = maxScore > 0 ? Math.min(100, Math.max(0, (totalScore / maxScore) * 100)) : 0;

    const { count } = await supabase.from('violations').select('*', { count: 'exact', head: true }).eq('session_id', sessionId);
    const trustScore = Math.max(0, 100 - (count || 0) * 5);
    const cheatProb = Math.min(100, (count || 0) * 10);

    await supabase.from('test_sessions').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_score: percentage,
      trust_score: trustScore,
      cheat_probability: cheatProb,
      cheat_status: cheatProb > 60 ? 'cheated' : cheatProb > 30 ? 'suspicious' : 'clean',
    }).eq('id', sessionId);

    navigate(`/results/${sessionId}`);
  }, [sessionId, navigate]);

  const handleAutoSubmit = useCallback(() => {
    toast({ title: "Test Auto-Submitted", description: "Too many violations detected.", variant: "destructive" });
    finishTest();
  }, [finishTest, toast]);

  const { tabSwitchCount } = useAntiCheat({
    sessionId: sessionId || '',
    userId: user?.id || '',
    maxViolations: 10,
    onAutoSubmit: handleAutoSubmit,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.from('coding_challenges').select('*').limit(3).then(({ data }) => {
      if (data) {
        setChallenges(data);
        const starterCode = data[0]?.starter_code;
        if (starterCode) {
          const parsed = typeof starterCode === 'string' ? JSON.parse(starterCode) : starterCode;
          setCode(parsed.javascript || '// Write your solution here\n');
        }
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { finishTest(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishTest]);

  const currentChallenge = challenges[currentIndex];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (currentChallenge?.starter_code) {
      const parsed = typeof currentChallenge.starter_code === 'string' ? JSON.parse(currentChallenge.starter_code) : currentChallenge.starter_code;
      setCode(parsed[lang] || `// Write your ${lang} solution here\n`);
    }
  };

  const runCode = () => {
    try {
      const fn = new Function(code + '\nreturn typeof twoSum !== "undefined" ? twoSum([2,7,11,15], 9) : typeof reverseString !== "undefined" ? reverseString(["h","e","l","l","o"]) : typeof isValid !== "undefined" ? isValid("()") : "No function found"');
      const result = fn();
      setOutput(`Output: ${JSON.stringify(result)}`);
    } catch (e: any) {
      setOutput(`Error: ${e.message}`);
    }
  };

  const submitChallenge = async () => {
    if (!sessionId || !currentChallenge) return;
    await supabase.from('test_answers').insert({
      session_id: sessionId,
      question_id: currentChallenge.id,
      question_type: 'coding',
      code_submission: code,
      time_spent_seconds: 1800 - timeLeft,
    });

    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex(prev => prev + 1);
      const next = challenges[currentIndex + 1];
      if (next?.starter_code) {
        const parsed = typeof next.starter_code === 'string' ? JSON.parse(next.starter_code) : next.starter_code;
        setCode(parsed[language] || '');
      }
      setOutput('');
    } else {
      finishTest();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen p-4 select-none">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Coding Round</h1>
            <Badge variant="outline">{currentChallenge?.difficulty?.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center gap-4">
            {tabSwitchCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> {tabSwitchCount} Warnings
              </Badge>
            )}
            <div className="flex items-center gap-2 font-mono">
              <Timer className="w-5 h-5" />
              <span className={timeLeft < 300 ? 'text-destructive' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-120px)]">
          <Card className="glass overflow-auto">
            <CardHeader>
              <CardTitle>{currentChallenge?.title || 'Challenge'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{currentChallenge?.description}</p>
              {currentChallenge?.test_cases && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Test Cases:</h4>
                  {(Array.isArray(currentChallenge.test_cases) ? currentChallenge.test_cases : JSON.parse(currentChallenge.test_cases)).map((tc: any, i: number) => (
                    <div key={i} className="bg-secondary/30 rounded p-3 mb-2 font-mono text-sm">
                      <div>Input: {tc.input}</div>
                      <div>Expected: {tc.expected}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={runCode}><Play className="w-4 h-4 mr-1" /> Run</Button>
                <Button size="sm" onClick={submitChallenge} className="neon-glow"><Send className="w-4 h-4 mr-1" /> Submit</Button>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden border border-border min-h-[300px]">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            {output && (
              <Card className="glass">
                <CardContent className="py-3">
                  <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTest;
