import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useEditorEvents } from "@/hooks/useEditorEvents";
import { useToast } from "@/hooks/use-toast";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Timer, AlertTriangle, Play, Send, Terminal, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@supabase/supabase-js";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const CodingTest = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const editorRef = useRef<any>(null);

  const finishTest = useCallback(async () => {
    if (!sessionId) return;
    editorEvents.stopBatching();
    const { data: allAnswers } = await supabase.from('test_answers').select('*').eq('session_id', sessionId);
    const totalScore = (allAnswers || []).reduce((sum, a) => sum + Number(a.score || 0), 0);
    const maxScore = (allAnswers || []).length * 10;
    const percentage = maxScore > 0 ? Math.min(100, Math.max(0, (totalScore / maxScore) * 100)) : 0;
    const { count } = await supabase.from('violations').select('*', { count: 'exact', head: true }).eq('session_id', sessionId);
    const trustScore = Math.max(0, 100 - (count || 0) * 5);
    const cheatProb = Math.min(100, (count || 0) * 10);

    await supabase.from('test_sessions').update({
      status: 'completed', completed_at: new Date().toISOString(),
      total_score: percentage, trust_score: trustScore, cheat_probability: cheatProb,
      cheat_status: cheatProb > 60 ? 'cheated' : cheatProb > 30 ? 'suspicious' : 'clean',
    }).eq('id', sessionId);

    navigate(`/results/${sessionId}`);
  }, [sessionId, navigate]);

  const handleAutoSubmit = useCallback(() => {
    toast({ title: "Test Auto-Submitted", description: "Too many violations.", variant: "destructive" });
    finishTest();
  }, [finishTest, toast]);

  const { tabSwitchCount } = useAntiCheat({
    sessionId: sessionId || '', userId: user?.id || '', maxViolations: 10, onAutoSubmit: handleAutoSubmit,
  });

  const editorEvents = useEditorEvents(sessionId || '', user?.id || '');

  useEffect(() => {
    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      if (userData.user) {
        const { data: skills } = await supabase.from('user_skills').select('skill_name').eq('user_id', userData.user.id);
        setUserSkills((skills || []).map(s => s.skill_name.toLowerCase()));
      }
      // Randomize: order by random-ish approach
      const { data } = await supabase.from('coding_challenges').select('*').limit(10);
      if (data) {
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 3);
        setChallenges(shuffled);
        const starterCode = shuffled[0]?.starter_code;
        if (starterCode) {
          const parsed = typeof starterCode === 'string' ? JSON.parse(starterCode) : starterCode;
          setCode(parsed.javascript || '// Write your solution here\n');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (user && sessionId) {
      editorEvents.startBatching();
      return () => editorEvents.stopBatching();
    }
  }, [user, sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { finishTest(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishTest]);

  const currentChallenge = challenges[currentIndex];

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent((ev) => { editorEvents.handleEditorChange(editor.getValue(), ev); });
    editor.onDidChangeCursorPosition((ev) => { editorEvents.handleCursorChange(ev); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => { editorEvents.addEvent('PASTE_BLOCKED'); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => { editorEvents.addEvent('COPY_BLOCKED'); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => { editorEvents.addEvent('SELECT_ALL_BLOCKED'); });
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (currentChallenge?.starter_code) {
      const parsed = typeof currentChallenge.starter_code === 'string' ? JSON.parse(currentChallenge.starter_code) : currentChallenge.starter_code;
      setCode(parsed[lang] || `// Write your ${lang} solution here\n`);
    }
  };

  const runCode = () => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleOutput(prev => [...prev, `[${timestamp}] Running...`]);

    try {
      if (language !== 'javascript' && language !== 'typescript') {
        setConsoleOutput(prev => [...prev, `[${timestamp}] ⚠️ Client-side execution supports JS/TS only. Your ${language} code will be evaluated on submission.`]);
        return;
      }

      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      const mockConsole = { log: (...args: any[]) => { logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); } };

      const wrappedCode = `
        const console = arguments[0];
        ${code}
        if (typeof twoSum !== "undefined") return twoSum([2,7,11,15], 9);
        if (typeof reverseString !== "undefined") return reverseString(["h","e","l","l","o"]);
        if (typeof isValid !== "undefined") return isValid("()");
        if (typeof fibonacci !== "undefined") return fibonacci(10);
        if (typeof isPalindrome !== "undefined") return isPalindrome("racecar");
        return "Function executed";
      `;
      const fn = new Function(wrappedCode);
      const result = fn(mockConsole);

      if (logs.length > 0) {
        setConsoleOutput(prev => [...prev, ...logs.map(l => `[${timestamp}] ${l}`)]);
      }
      setConsoleOutput(prev => [...prev, `[${timestamp}] ✅ Output: ${JSON.stringify(result)}`]);
    } catch (e: any) {
      setConsoleOutput(prev => [...prev, `[${timestamp}] ❌ Error: ${e.message}`]);
    }
  };

  const clearConsole = () => setConsoleOutput([]);

  const submitChallenge = async () => {
    if (!sessionId || !currentChallenge) return;
    await editorEvents.flushEvents();

    await supabase.from('test_answers').insert({
      session_id: sessionId, question_id: currentChallenge.id, question_type: 'coding',
      code_submission: code, time_spent_seconds: 1800 - timeLeft,
    });

    if (currentIndex + 1 < challenges.length) {
      setCurrentIndex(prev => prev + 1);
      const next = challenges[currentIndex + 1];
      if (next?.starter_code) {
        const parsed = typeof next.starter_code === 'string' ? JSON.parse(next.starter_code) : next.starter_code;
        setCode(parsed[language] || '');
      }
      setConsoleOutput([]);
    } else {
      finishTest();
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const availableLanguages = LANGUAGES.filter(l => {
    if (userSkills.length === 0) return true;
    return userSkills.some(s => l.label.toLowerCase().includes(s) || l.value.includes(s));
  });
  const displayLangs = availableLanguages.length > 0 ? availableLanguages : LANGUAGES;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const diffColor = currentChallenge?.difficulty === 'easy' ? 'border-accent/30 text-accent' : currentChallenge?.difficulty === 'medium' ? 'border-warning/30 text-warning' : 'border-destructive/30 text-destructive';

  return (
    <div className="min-h-screen p-3 md:p-4 select-none">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Terminal className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Coding Round</h1>
              <Badge variant="outline" className={`text-xs ${diffColor}`}>{currentChallenge?.difficulty?.toUpperCase()}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {tabSwitchCount > 0 && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" /> {tabSwitchCount}
              </Badge>
            )}
            <div className="flex items-center gap-2 font-mono text-sm glass px-3 py-1.5 rounded-lg">
              <Timer className="w-4 h-4 text-primary" />
              <span className={timeLeft < 300 ? 'text-destructive font-bold' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-3 h-[calc(100vh-90px)]">
          {/* Problem Panel */}
          <Card className="glass overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{currentChallenge?.title || 'Challenge'}</CardTitle>
                <span className="text-xs text-muted-foreground font-mono">
                  {currentIndex + 1}/{challenges.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{currentChallenge?.description}</p>
              {currentChallenge?.test_cases && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Test Cases:</h4>
                  {(Array.isArray(currentChallenge.test_cases) ? currentChallenge.test_cases : JSON.parse(currentChallenge.test_cases)).map((tc: any, i: number) => (
                    <div key={i} className="bg-secondary/30 rounded-lg p-3 mb-2 font-mono text-xs">
                      <div className="text-muted-foreground">Input: <span className="text-foreground">{tc.input}</span></div>
                      <div className="text-muted-foreground">Expected: <span className="text-accent">{tc.expected}</span></div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">⚠️ Hidden test cases will be used for final scoring</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor Panel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {displayLangs.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={runCode} className="h-9">
                  <Play className="w-4 h-4 mr-1" /> Run
                </Button>
                <Button size="sm" onClick={submitChallenge} className="gradient-primary text-primary-foreground h-9">
                  <Send className="w-4 h-4 mr-1" /> Submit
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className={`rounded-lg overflow-hidden border border-border ${showConsole ? 'flex-1 min-h-[200px]' : 'flex-1 min-h-[250px]'}`}>
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(v) => setCode(v || '')}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 14, minimap: { enabled: false },
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: { top: 16 }, scrollBeyondLastLine: false, contextmenu: false,
                }}
              />
            </div>

            {/* Console Panel */}
            <div className="glass rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Console</span>
                  {consoleOutput.length > 0 && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{consoleOutput.length}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={clearConsole} className="h-6 px-2 text-xs text-muted-foreground">Clear</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowConsole(!showConsole)} className="h-6 w-6 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {showConsole && (
                <div className="p-3 max-h-[180px] overflow-y-auto font-mono text-xs space-y-1">
                  {consoleOutput.length === 0 ? (
                    <p className="text-muted-foreground">Click "Run" to see output here...</p>
                  ) : (
                    consoleOutput.map((line, i) => (
                      <div key={i} className={`${line.includes('❌') ? 'text-destructive' : line.includes('✅') ? 'text-accent' : line.includes('⚠️') ? 'text-warning' : 'text-foreground'}`}>
                        {line}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingTest;
