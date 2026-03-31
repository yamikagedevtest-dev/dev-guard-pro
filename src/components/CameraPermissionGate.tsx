import { useState, useCallback } from "react";
import { Camera, CameraOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface CameraPermissionGateProps {
  onGranted: () => void;
}

export default function CameraPermissionGate({ onGranted }: CameraPermissionGateProps) {
  const [status, setStatus] = useState<"prompt" | "denied" | "checking">("prompt");

  const requestCamera = useCallback(async () => {
    setStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      onGranted();
    } catch {
      setStatus("denied");
    }
  }, [onGranted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass glow rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          {status === "denied" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <CameraOff className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Camera Access Denied</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Camera access is <span className="text-destructive font-semibold">mandatory</span> for proctored tests.
                Please enable camera permissions in your browser settings and try again.
              </p>
              <div className="space-y-3">
                <Button onClick={requestCamera} className="w-full gradient-primary text-primary-foreground">
                  <Camera className="w-4 h-4 mr-2" /> Try Again
                </Button>
                <p className="text-xs text-muted-foreground">
                  Go to browser Settings → Privacy → Camera → Allow for this site
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Camera Permission Required</h2>
              <p className="text-sm text-muted-foreground mb-6">
                This test is proctored. Your webcam will be active throughout the assessment to ensure test integrity.
                You cannot proceed without camera access.
              </p>
              <Button
                onClick={requestCamera}
                disabled={status === "checking"}
                className="w-full gradient-primary text-primary-foreground"
              >
                {status === "checking" ? (
                  "Checking..."
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" /> Enable Camera & Start
                  </>
                )}
              </Button>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
