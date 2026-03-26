import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useToast } from "@/hooks/use-toast";
import { Timer, AlertTriangle, Shield } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const MCQTest = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<string, { answer: number; correct: boolean }>>(new Map());
  const [difficulty, setDifficulty] = useState("easy");
  const [timeLeft, setTimeLeft] = useState(1800);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const finishMCQ = useCallback(async () => {
    if (!sessionId) return;
    await supabase.from('test_sessions').update({ current_difficulty: difficulty }).eq('id', sessionId);
    navigate(`/test/coding/${sessionId}`);
  }, [sessionId, difficulty, navigate]);

  const handleAutoSubmit = useCallback(() => {
    toast({ title: "Test Auto-Submitted", description: "Too many violations detected.", variant: "destructive" });
    finishMCQ();
  }, [finishMCQ, toast]);

  const { tabSwitchCount } = useAntiCheat({
    sessionId: sessionId || '',
    userId: user?.id || '',
    maxViolations: 10,
    onAutoSubmit: handleAutoSubmit,
  });

  const loadQuestions = async (diff: string) => {
    const { data } = await supabase.from('mcq_questions').select('*').eq('difficulty', diff).limit(5);
    if (data && data.length > 0) {
      setQuestions(prev => [...prev, ...data]);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadQuestions("easy");
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishMCQ(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finishMCQ]);

  const currentQuestion = questions[currentIndex];

  const submitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion || !sessionId) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    await supabase.from('test_answers').insert({
      session_id: sessionId,
      question_id: currentQuestion.id,
      question_type: 'mcq',
      user_answer: String(selectedAnswer),
      is_correct: isCorrect,
      score: isCorrect ? 10 : -(Number(currentQuestion.negative_marks) || 0.25) * 10,
      time_spent_seconds: timeSpent,
    });

    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, { answer: selectedAnswer, correct: isCorrect });
    setAnswers(newAnswers);

    if (isCorrect) setScore(prev => prev + 10);
    else setScore(prev => prev - (Number(currentQuestion.negative_marks) || 0.25) * 10);

    // Adaptive difficulty
    const recentAnswers = Array.from(newAnswers.values()).slice(-3);
    const recentCorrect = recentAnswers.filter(a => a.correct).length;
    let newDifficulty = difficulty;
    if (recentCorrect >= 3 && difficulty === 'easy') newDifficulty = 'medium';
    else if (recentCorrect >= 3 && difficulty === 'medium') newDifficulty = 'hard';
    else if (recentCorrect < 1 && difficulty === 'hard') newDifficulty = 'medium';
    else if (recentCorrect < 1 && difficulty === 'medium') newDifficulty = 'easy';

    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      await loadQuestions(newDifficulty);
      toast({ title: `Difficulty: ${newDifficulty.toUpperCase()}`, description: "Questions adapted to your level" });
    }

    if (currentIndex + 1 >= questions.length && currentIndex >= 9) {
      finishMCQ();
    } else {
      if (currentIndex + 1 >= questions.length) {
        await loadQuestions(newDifficulty);
      }
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading && questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen p-6 select-none">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">MCQ Round</h1>
              <Badge variant="outline">{difficulty.toUpperCase()}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {tabSwitchCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" /> {tabSwitchCount} Tab Switches
              </Badge>
            )}
            <div className="flex items-center gap-2 text-lg font-mono">
              <Timer className="w-5 h-5" />
              <span className={timeLeft < 300 ? 'text-destructive' : ''}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <Progress value={(currentIndex / Math.max(questions.length, 10)) * 100} className="mb-6 h-2" />

        {currentQuestion && (
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {currentIndex + 1}</CardTitle>
                <span className="text-sm text-muted-foreground">Score: {score}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">{currentQuestion.question}</p>
              <div className="space-y-3">
                {(Array.isArray(currentQuestion.options) ? currentQuestion.options : JSON.parse(currentQuestion.options)).map((option: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswer(i)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAnswer === i
                        ? 'border-primary bg-primary/10 neon-glow'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                    }`}
                  >
                    <span className="font-mono text-sm text-muted-foreground mr-3">{String.fromCharCode(65 + i)}</span>
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={finishMCQ}>Skip to Coding</Button>
                <Button onClick={submitAnswer} disabled={selectedAnswer === null} className="neon-glow">
                  {currentIndex >= 9 ? 'Finish MCQ' : 'Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MCQTest;
