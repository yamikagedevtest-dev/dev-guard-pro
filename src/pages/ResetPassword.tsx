import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked link and was auto-logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Password updated successfully!" });
      navigate("/dashboard");
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card relative z-10 w-full max-w-[380px]"
      >
        <div className="login-card-border" />
        <div className="login-card-content">
          <div className="flex justify-center mb-6">
            <Logo size={40} />
          </div>
          <h2 className="login-heading">Set New Password</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your new password below.
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="login-input"
            />
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
