export function SouthPoleWatermark() {
  return (
    <div className="flex items-center gap-3 select-none pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
      {/* Blue circular crescent indicator */}
      <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
        <svg className="h-10 w-10 text-cyan-400" viewBox="0 0 40 40" fill="none">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeOpacity="0.4"
          />
          <path
            d="M 12 28 A 16 16 0 0 1 28 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          />
          <circle cx="28" cy="12" r="2.5" fill="#38bdf8" />
        </svg>
      </div>

      <div>
        <div className="text-xs font-semibold text-foreground/90 tracking-wide">
          Missions to the
        </div>
        <div className="text-xs font-bold bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
          Moon's South Pole
        </div>
      </div>
    </div>
  );
}
