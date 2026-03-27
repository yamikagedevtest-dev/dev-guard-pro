import { useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EditorEvent {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export function useEditorEvents(sessionId: string, userId: string) {
  const events = useRef<EditorEvent[]>([]);
  const batchTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback((type: string, data?: Record<string, unknown>) => {
    events.current.push({ type, timestamp: Date.now(), data });
  }, []);

  const flushEvents = useCallback(async () => {
    if (events.current.length === 0 || !sessionId || !userId) return;
    const batch = [...events.current];
    events.current = [];

    // Store as a violation with type 'editor_events' for playback
    await supabase.from('violations').insert({
      session_id: sessionId,
      user_id: userId,
      violation_type: 'editor_events',
      severity: 'info',
      details: { events: batch } as any,
    });
  }, [sessionId, userId]);

  const startBatching = useCallback(() => {
    if (batchTimer.current) return;
    batchTimer.current = setInterval(flushEvents, 5000);
  }, [flushEvents]);

  const stopBatching = useCallback(() => {
    if (batchTimer.current) {
      clearInterval(batchTimer.current);
      batchTimer.current = null;
    }
    flushEvents();
  }, [flushEvents]);

  const handleEditorChange = useCallback((value: string | undefined, ev: any) => {
    if (!ev?.changes) return;
    for (const change of ev.changes) {
      const insertLen = change.text?.length || 0;
      const deleteLen = change.rangeLength || 0;

      addEvent('edit', {
        insertLen,
        deleteLen,
        line: change.range?.startLineNumber,
        col: change.range?.startColumn,
      });

      // Detect paste-like: large insert
      if (insertLen > 20 && !change.text?.includes('\n')) {
        addEvent('PASTE_SUSPECTED', { insertLen, text: change.text?.substring(0, 50) });
      } else if (insertLen > 50) {
        addEvent('PASTE_SUSPECTED', { insertLen, lines: change.text?.split('\n').length });
      }
    }
  }, [addEvent]);

  const handleCursorChange = useCallback((ev: any) => {
    if (!ev?.position) return;
    addEvent('cursor', {
      line: ev.position.lineNumber,
      col: ev.position.column,
    });
  }, [addEvent]);

  return {
    events,
    addEvent,
    handleEditorChange,
    handleCursorChange,
    startBatching,
    stopBatching,
    flushEvents,
  };
}