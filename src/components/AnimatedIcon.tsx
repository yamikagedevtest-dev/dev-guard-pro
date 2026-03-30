import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  variant?: "pulse" | "bounce" | "spin" | "glow" | "float";
}

const variants = {
  pulse: {
    animate: { scale: [1, 1.15, 1], opacity: [1, 0.8, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
  bounce: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 3, repeat: Infinity, ease: "linear" as const },
  },
  glow: {
    animate: { filter: ["drop-shadow(0 0 4px hsl(250 85% 65% / 0.3))", "drop-shadow(0 0 12px hsl(250 85% 65% / 0.6))", "drop-shadow(0 0 4px hsl(250 85% 65% / 0.3))"] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
  float: {
    animate: { y: [0, -8, 0], rotate: [0, 3, -3, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const AnimatedIcon = ({ icon: Icon, size = 24, className, variant = "glow" }: AnimatedIconProps) => {
  const v = variants[variant];
  return (
    <motion.div animate={v.animate} transition={v.transition} className={cn("inline-flex", className)}>
      <Icon size={size} />
    </motion.div>
  );
};

export default AnimatedIcon;
