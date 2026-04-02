import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

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

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="login-heading">Check Your Email</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <button onClick={() => navigate("/login")} className="login-button mt-4">
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="login-heading">Reset Password</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="login-form">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="login-input"
                />
                <button type="submit" disabled={loading} className="login-button">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mt-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
