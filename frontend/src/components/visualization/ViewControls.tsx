import { RotateCcw } from "lucide-react";

interface Props {
  onResetView: () => void;
}

export function ViewControls({ onResetView }: Props) {
  return (
    <div className="glass rounded-2xl p-4 w-full backdrop-blur-xl border border-white/15 bg-black/40 text-xs shadow-xl transition-all select-none">
      <div className="font-semibold text-foreground mb-3 text-sm tracking-wide">
        View Controls
      </div>

      <div className="space-y-3">
        {/* Rotate */}
        <div className="flex items-center gap-3 text-secondary-foreground">
          {/* Custom Mouse SVG with left button highlighted */}
          <svg
            className="h-4 w-4 text-cyan-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="7" />
            <path d="M12 2v6" />
            <path d="M5 8h14" />
            <path d="M7 5h3v2H7z" fill="currentColor" fillOpacity="0.8" />
          </svg>
          <span className="font-medium">Rotate</span>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-3 text-secondary-foreground">
          {/* Custom Mouse SVG with wheel highlighted */}
          <svg
            className="h-4 w-4 text-cyan-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="7" />
            <rect x="11" y="5" width="2" height="4" rx="1" fill="currentColor" />
          </svg>
          <span className="font-medium">Zoom</span>
        </div>

        {/* Pan */}
        <div className="flex items-center gap-3 text-secondary-foreground">
          {/* Hand SVG */}
          <svg
            className="h-4 w-4 text-cyan-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span className="font-medium">Pan</span>
        </div>

        {/* Reset View Button */}
        <button
          onClick={onResetView}
          className="flex w-full items-center gap-3 pt-2 text-secondary-foreground hover:text-white transition-colors cursor-pointer group text-left border-t border-white/10"
        >
          <RotateCcw className="h-4 w-4 text-purple-400 group-hover:rotate-[-45deg] transition-transform" />
          <span className="font-medium group-hover:text-cyan-300">Reset View</span>
        </button>
      </div>
    </div>
  );
}
