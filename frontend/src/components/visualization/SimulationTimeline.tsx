import { Play, Pause, Maximize2, Minimize2, RotateCcw, FastForward } from "lucide-react";

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  timelineValue: number; // 0 to 100
  onChangeTimeline: (val: number) => void;
  currentUtcDateString: string;
  onResetTime: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export function SimulationTimeline({
  isPlaying,
  onTogglePlay,
  timelineValue,
  onChangeTimeline,
  currentUtcDateString,
  onResetTime,
  isFullscreen,
  onToggleFullscreen,
  simSpeed,
  onChangeSpeed,
}: Props) {
  const speeds = [1, 5, 24];

  return (
    <div className="glass rounded-2xl px-4 py-2.5 w-full backdrop-blur-xl border border-white/15 bg-black/70 text-xs shadow-2xl flex flex-wrap sm:flex-nowrap items-center gap-3 transition-all select-none">
      {/* Play / Pause button */}
      <button
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
        className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25 transition-transform active:scale-95 cursor-pointer ring-1 ring-white/30"
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-white" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
        )}
      </button>

      {/* Speed Selector */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
        <FastForward className="h-3 w-3 text-muted-foreground ml-1" />
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onChangeSpeed(s)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
              simSpeed === s
                ? "bg-purple-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Timeline Slider with glow track & current UTC timestamp */}
      <div className="flex-1 flex flex-col gap-0.5 min-w-[180px]">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={timelineValue}
            onChange={(e) => onChangeTimeline(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span className="text-cyan-300 font-semibold">{currentUtcDateString}</span>
          <button
            onClick={onResetTime}
            title="Reset to Present UTC"
            className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
          >
            <RotateCcw className="h-2.5 w-2.5 text-cyan-400" />
            <span>Now</span>
          </button>
        </div>
      </div>

      {/* Ephemeris Sync Label */}
      <div className="hidden md:flex flex-col text-right shrink-0 border-l border-white/10 pl-3">
        <span className="text-[11px] font-semibold text-foreground tracking-wide">Mission Timeline</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">Ephemeris Sync</span>
      </div>

      {/* Fullscreen Toggle */}
      <button
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="h-7 w-7 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-auto sm:ml-0"
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
