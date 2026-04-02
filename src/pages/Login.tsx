import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'twitter') => {
    setSocialLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setSocialLoading(null);
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
          <h2 className="login-heading">Sign In</h2>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <span className="login-forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </span>
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-social-container">
            <span className="login-social-title">Or Sign in with</span>
            <div className="login-social-buttons">
              <button
                className="login-social-btn"
                aria-label="Sign in with Google"
                disabled={!!socialLoading}
                onClick={() => handleSocialLogin('google')}
              >
                {socialLoading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 488 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                )}
              </button>
              <button
                className="login-social-btn"
                aria-label="Sign in with Apple"
                disabled={!!socialLoading}
                onClick={() => handleSocialLogin('apple')}
              >
                {socialLoading === 'apple' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                )}
              </button>
              <button
                className="login-social-btn"
                aria-label="Sign in with X"
                disabled={!!socialLoading}
                onClick={() => handleSocialLogin('twitter')}
              >
                {socialLoading === 'twitter' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
