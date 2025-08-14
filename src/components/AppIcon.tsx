interface AppIconProps {
  size?: number;
  className?: string;
}

export function AppIcon({
  size = 64,
  className = "",
}: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle - Deep Navy */}
      <circle cx="32" cy="32" r="32" fill="var(--bn-navy)" />

      {/* Vinyl Record Base - Black */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="#0a0a0a"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth="0.5"
      />

      {/* Vinyl Grooves - More pronounced for small sizes */}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="0.5"
      />
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="0.5"
      />
      <circle
        cx="32"
        cy="32"
        r="14"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="0.5"
      />

      {/* Blue Note Geometric Elements - Simplified */}
      {/* Electric Teal Rectangle */}
      <rect
        x="12"
        y="8"
        width="14"
        height="2.5"
        fill="var(--bn-electric-teal)"
        transform="rotate(12 19 9.25)"
      />

      {/* Vibrant Orange Triangle */}
      <path
        d="M49 17 L55 17 L52 23 Z"
        fill="var(--bn-vibrant-orange)"
      />

      {/* Bright Yellow Circle */}
      <circle
        cx="51"
        cy="47"
        r="3.5"
        fill="var(--bn-bright-yellow)"
      />

      {/* Record Label - Simple Teal Circle */}
      <circle
        cx="32"
        cy="32"
        r="7"
        fill="var(--bn-electric-teal)"
      />

      {/* Ultra-clean center - Just a simple pattern */}
      {/* Three dots pattern - Very scalable */}
      <circle
        cx="32"
        cy="29"
        r="0.8"
        fill="var(--bn-deep-black)"
      />
      <circle
        cx="29.5"
        cy="32"
        r="0.8"
        fill="var(--bn-deep-black)"
      />
      <circle
        cx="34.5"
        cy="32"
        r="0.8"
        fill="var(--bn-deep-black)"
      />
      <circle
        cx="32"
        cy="35"
        r="0.8"
        fill="var(--bn-deep-black)"
      />

      {/* Center Hole */}
      <circle cx="32" cy="32" r="1.5" fill="#0a0a0a" />

      {/* Highlight on vinyl for dimension */}
      <path
        d="M 32 6 A 26 26 0 0 1 58 32"
        fill="none"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Small accent elements */}
      <rect
        x="9"
        y="25"
        width="2.5"
        height="2.5"
        fill="var(--bn-coral-red)"
        transform="rotate(45 10.25 26.25)"
      />
    </svg>
  );
}