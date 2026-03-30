import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: boolean;
}

const GlowCard = ({ children, className, hoverScale = true }: GlowCardProps) => (
  <div className={cn(
    "glow-card relative rounded-xl overflow-hidden transition-all duration-500 group",
    hoverScale && "hover:scale-[1.03]",
    className
  )}>
    <div className="glow-card-border absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="glow-card-content relative rounded-xl border border-border/40 bg-card/70 backdrop-blur-2xl p-6">
      {children}
    </div>
  </div>
);

export default GlowCard;
