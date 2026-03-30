import { motion } from "framer-motion";

const ChipLoader = ({ text = "Loading" }: { text?: string }) => (
  <div className="flex items-center justify-center w-full h-full min-h-[200px]">
    <div className="w-full max-w-[500px]">
      <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <defs>
          <linearGradient id="chipGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--card))" />
            <stop offset="100%" stopColor="hsl(var(--background))" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--foreground))" />
            <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
          </linearGradient>
          <linearGradient id="pinGradient" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--muted-foreground))" />
            <stop offset="50%" stopColor="hsl(var(--border))" />
            <stop offset="100%" stopColor="hsl(var(--muted))" />
          </linearGradient>
        </defs>
        <g id="traces">
          {/* Left traces */}
          <path d="M100 100 H200 V210 H326" className="trace-bg" />
          <path d="M100 100 H200 V210 H326" className="trace-flow purple" />
          <path d="M80 180 H180 V230 H326" className="trace-bg" />
          <path d="M80 180 H180 V230 H326" className="trace-flow blue" />
          <path d="M60 260 H150 V250 H326" className="trace-bg" />
          <path d="M60 260 H150 V250 H326" className="trace-flow yellow" />
          <path d="M100 350 H200 V270 H326" className="trace-bg" />
          <path d="M100 350 H200 V270 H326" className="trace-flow green" />
          {/* Right traces */}
          <path d="M700 90 H560 V210 H474" className="trace-bg" />
          <path d="M700 90 H560 V210 H474" className="trace-flow blue" />
          <path d="M740 160 H580 V230 H474" className="trace-bg" />
          <path d="M740 160 H580 V230 H474" className="trace-flow green" />
          <path d="M720 250 H590 V250 H474" className="trace-bg" />
          <path d="M720 250 H590 V250 H474" className="trace-flow red" />
          <path d="M680 340 H570 V270 H474" className="trace-bg" />
          <path d="M680 340 H570 V270 H474" className="trace-flow yellow" />
        </g>
        {/* Chip body */}
        <rect x="330" y="190" width="140" height="100" rx="20" ry="20"
          fill="url(#chipGradient)" stroke="hsl(var(--border))" strokeWidth="3"
          filter="drop-shadow(0 0 6px rgba(0,0,0,0.8))" />
        {/* Left pins */}
        {[205, 225, 245, 265].map(y => (
          <rect key={`l${y}`} x="322" y={y} width="8" height="10" fill="url(#pinGradient)" rx="2" />
        ))}
        {/* Right pins */}
        {[205, 225, 245, 265].map(y => (
          <rect key={`r${y}`} x="470" y={y} width="8" height="10" fill="url(#pinGradient)" rx="2" />
        ))}
        <text x="400" y="245" fontFamily="'Inter', sans-serif" fontSize="22"
          fill="url(#textGradient)" textAnchor="middle" alignmentBaseline="middle">
          {text}
        </text>
        {/* Endpoint dots */}
        {[[100,100],[80,180],[60,260],[100,350],[700,90],[740,160],[720,250],[680,340]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        ))}
      </svg>
    </div>
  </div>
);

export default ChipLoader;
