import logoImg from '/logo.png';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = 32, showText = true, className = '' }: LogoProps) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <img src={logoImg} alt="Yamikage" width={size} height={size} className="rounded-lg" />
    {showText && (
      <span className="text-lg font-bold tracking-tight">
        <span className="gradient-text">Yamikage</span>
      </span>
    )}
  </div>
);

export default Logo;
