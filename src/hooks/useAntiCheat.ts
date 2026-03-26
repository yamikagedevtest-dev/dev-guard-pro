import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AntiCheatConfig {
  sessionId: string;
  userId: string;
  maxViolations?: number;
  onAutoSubmit?: () => void;
}

interface Violation {
  type: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export function useAntiCheat({ sessionId, userId, maxViolations = 10, onAutoSubmit }: AntiCheatConfig) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
  const keystrokeTimestamps = useRef<number[]>([]);
  const violationCount = useRef(0);

  const addViolation = useCallback(async (type: string, details?: Record<string, unknown>) => {
    const violation: Violation = { type, timestamp: Date.now(), details };
    setViolations(prev => [...prev, violation]);
    violationCount.current++;

    if (sessionId && userId) {
      await supabase.from('violations').insert({
        session_id: sessionId,
        user_id: userId,
        violation_type: type,
        details: details as any,
        severity: violationCount.current > 5 ? 'high' : violationCount.current > 2 ? 'medium' : 'low',
      });
    }

    if (violationCount.current >= maxViolations && onAutoSubmit) {
      onAutoSubmit();
    }
  }, [sessionId, userId, maxViolations, onAutoSubmit]);

  useEffect(() => {
    if (!sessionId || !userId) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        addViolation('tab_switch', { hidden: true });
      }
    };

    const handleBlur = () => addViolation('window_blur');

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyPasteAttempts(prev => prev + 1);
      addViolation('copy_attempt');
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyPasteAttempts(prev => prev + 1);
      addViolation('paste_attempt');
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      setCopyPasteAttempts(prev => prev + 1);
      addViolation('cut_attempt');
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      addViolation('right_click');
    };

    const devtoolsCheck = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        addViolation('devtools_detected');
      }
    }, 3000);

    const handleKeydown = (e: KeyboardEvent) => {
      const now = Date.now();
      keystrokeTimestamps.current.push(now);
      if (keystrokeTimestamps.current.length > 50) {
        keystrokeTimestamps.current = keystrokeTimestamps.current.slice(-50);
      }

      const oneSecAgo = now - 1000;
      const recentKeys = keystrokeTimestamps.current.filter(t => t > oneSecAgo);
      if (recentKeys.length > 20) {
        addViolation('typing_burst', { keysPerSecond: recentKeys.length });
      }

      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          addViolation('keyboard_shortcut_blocked', { key: e.key });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown);
      clearInterval(devtoolsCheck);
    };
  }, [addViolation, sessionId, userId]);

  return { violations, tabSwitchCount, copyPasteAttempts, violationCount: violationCount.current };
}
