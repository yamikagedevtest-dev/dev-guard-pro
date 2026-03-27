import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, SkipBack, AlertTriangle } from "lucide-react";
import Editor from "@monaco-editor/react";

interface EditEvent {
  type: string;
  timestamp: number;
  data?: {
    insertLen?: number;
    deleteLen?: number;
    line?: number;
    col?: number;
    text?: string;
    lines?: number;
  };
}

interface CodePlaybackProps {
  events: EditEvent[];
  finalCode: string;
  language?: string;
}

const CodePlayback = ({ events, finalCode, language = "javascript" }: CodePlaybackProps) => {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editEvents = events.filter(e => e.type === 'edit' || e.type === 'PASTE_SUSPECTED');
  const totalEvents = editEvents.length;

  const flaggedEvents = events.filter(e => e.type === 'PASTE_SUSPECTED');

  // Build code state at given position (simplified: show progress indicator)
  const getProgress = () => {
    if (totalEvents === 0) return 0;
    return Math.round((position / totalEvents) * 100);
  };

  const play = useCallback(() => {
    if (position >= totalEvents) { setPlaying(false); return; }
    setPlaying(true);
  }, [position, totalEvents]);

  useEffect(() => {
    if (!playing || position >= totalEvents) {
      setPlaying(false);
      return;
    }

    const delay = Math.max(20, 100 / speed);
    playRef.current = setTimeout(() => {
      setPosition(p => p + 1);
    }, delay);

    return () => { if (playRef.current) clearTimeout(playRef.current); };
  }, [playing, position, speed, totalEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPosition(Math.max(0, position - 10))}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => playing ? setPlaying(false) : play()}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPosition(Math.min(totalEvents, position + 10))}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 5].map(s => (
            <Button key={s} variant={speed === s ? "default" : "outline"} size="sm" onClick={() => setSpeed(s)}>
              {s}x
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{position}/{totalEvents} edits</span>
          <span className="text-sm font-bold">{getProgress()}%</span>
        </div>
      </div>

      <Slider
        value={[position]}
        max={totalEvents}
        step={1}
        onValueChange={(v) => setPosition(v[0])}
        className="cursor-pointer"
      />

      {/* Flagged events */}
      {flaggedEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flaggedEvents.map((e, i) => (
            <Badge key={i} variant="destructive" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Paste @ {new Date(e.timestamp).toLocaleTimeString()}
              {e.data?.insertLen && ` (${e.data.insertLen} chars)`}
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-border h-[400px]">
        <Editor
          height="100%"
          language={language}
          value={position >= totalEvents ? finalCode : `// Replaying... ${getProgress()}% complete\n// ${position} of ${totalEvents} edit events`}
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
    </div>
  );
};

export default CodePlayback;