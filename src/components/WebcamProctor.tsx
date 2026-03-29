import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraOff, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebcamProctorProps {
  sessionId: string;
  userId: string;
  onViolation?: (type: string) => void;
}

export default function WebcamProctor({ sessionId, userId, onViolation }: WebcamProctorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const noFaceCountRef = useRef(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const { toast } = useToast();

  const logViolation = useCallback(async (type: string, details?: Record<string, unknown>) => {
    if (sessionId && userId) {
      await supabase.from("violations").insert({
        session_id: sessionId,
        user_id: userId,
        violation_type: type,
        details: details as any,
        severity: "medium",
      });
    }
    onViolation?.(type);
  }, [sessionId, userId, onViolation]);

  const initFaceDetector = useCallback(async () => {
    // Use the browser's FaceDetector API if available (Chrome/Edge)
    if ("FaceDetector" in window) {
      try {
        detectorRef.current = new (window as any).FaceDetector({ maxDetectedFaces: 5, fastMode: true });
        return true;
      } catch { return false; }
    }
    return false;
  }, []);

  const checkForFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    if (detectorRef.current) {
      try {
        const faces = await detectorRef.current.detect(canvas);
        if (faces.length === 0) {
          noFaceCountRef.current++;
          setFaceDetected(false);
          if (noFaceCountRef.current >= 3) {
            setWarningMessage("No face detected! Please stay in front of the camera.");
            logViolation("no_face_detected", { consecutiveChecks: noFaceCountRef.current });
            toast({ title: "⚠️ Face Not Detected", description: "Please position yourself in front of the camera.", variant: "destructive" });
          }
          if (noFaceCountRef.current >= 2 && faces.length > 1) {
            setWarningMessage("Multiple faces detected!");
            logViolation("multiple_faces", { faceCount: faces.length });
          }
        } else {
          if (faces.length > 1) {
            setWarningMessage("Multiple faces detected! Only one person allowed.");
            logViolation("multiple_faces", { faceCount: faces.length });
          } else {
            setWarningMessage("");
          }
          noFaceCountRef.current = 0;
          setFaceDetected(true);
        }
      } catch {
        // FaceDetector not working, fallback to just monitoring camera
      }
    } else {
      // No FaceDetector API — just verify camera feed is active
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let darkPixels = 0;
      const sampleSize = Math.min(data.length / 4, 1000);
      const step = Math.floor(data.length / 4 / sampleSize);
      for (let i = 0; i < data.length; i += step * 4) {
        if (data[i] < 15 && data[i + 1] < 15 && data[i + 2] < 15) darkPixels++;
      }
      if (darkPixels > sampleSize * 0.9) {
        noFaceCountRef.current++;
        setFaceDetected(false);
        if (noFaceCountRef.current >= 3) {
          setWarningMessage("Camera appears blocked or covered.");
          logViolation("camera_blocked", { consecutiveChecks: noFaceCountRef.current });
        }
      } else {
        noFaceCountRef.current = 0;
        setFaceDetected(true);
        setWarningMessage("");
      }
    }
  }, [cameraActive, logViolation, toast]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setPermissionDenied(false);

      await initFaceDetector();

      // Check for face every 3 seconds
      checkIntervalRef.current = setInterval(checkForFace, 3000);
    } catch (err: any) {
      console.error("Camera error:", err);
      setPermissionDenied(true);
      logViolation("camera_permission_denied");
      toast({ title: "Camera Required", description: "Please allow camera access for proctoring.", variant: "destructive" });
    }
  }, [initFaceDetector, checkForFace, logViolation, toast]);

  useEffect(() => {
    startCamera();
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Restart interval when checkForFace changes
  useEffect(() => {
    if (cameraActive && checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = setInterval(checkForFace, 3000);
    }
  }, [checkForFace, cameraActive]);

  return (
    <div className="relative">
      {/* Webcam feed */}
      <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
        !faceDetected ? "border-destructive shadow-[0_0_15px_hsl(0_72%_51%/0.3)]" :
        cameraActive ? "border-accent/50 shadow-[0_0_10px_hsl(145_65%_42%/0.15)]" :
        "border-border"
      }`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-xl"
          style={{ maxHeight: 180, objectFit: "cover", transform: "scaleX(-1)" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Status overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {cameraActive ? (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              faceDetected ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive animate-pulse"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${faceDetected ? "bg-accent" : "bg-destructive"}`} />
              {faceDetected ? "Proctored" : "No Face"}
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/20 text-destructive">
              <CameraOff className="w-3 h-3" />
              Off
            </div>
          )}
        </div>

        {/* Retry button when permission denied */}
        {permissionDenied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 gap-2">
            <CameraOff className="w-8 h-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center px-2">Camera access required</p>
            <button
              onClick={startCamera}
              className="text-xs text-primary underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Warning banner */}
      {warningMessage && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {warningMessage}
        </div>
      )}
    </div>
  );
}
