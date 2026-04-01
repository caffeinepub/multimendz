import { MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

const MAP_BLOCKS = [
  [10, 10],
  [30, 10],
  [55, 10],
  [10, 35],
  [30, 35],
  [55, 35],
  [10, 62],
  [30, 62],
  [55, 62],
] as const;

interface LiveMapProps {
  bookingId?: bigint;
  className?: string;
  animated?: boolean;
}

export default function LiveMap({
  className = "",
  animated = true,
}: LiveMapProps) {
  const [pos, setPos] = useState({ x: 42, y: 55 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setPos((prev) => {
        const next = {
          x: Math.max(10, Math.min(85, prev.x + (Math.random() - 0.45) * 5)),
          y: Math.max(10, Math.min(85, prev.y + (Math.random() - 0.45) * 5)),
        };
        setTrail((t) => [...t.slice(-6), prev]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-[oklch(72%_0.04_251)] map-grid ${className}`}
      data-ocid="track.canvas_target"
    >
      {/* Roads horizontal */}
      <div className="map-road-h" style={{ top: "30%", left: 0, right: 0 }} />
      <div className="map-road-h" style={{ top: "55%", left: 0, right: 0 }} />
      <div className="map-road-h" style={{ top: "78%", left: 0, right: 0 }} />
      {/* Roads vertical */}
      <div className="map-road-v" style={{ left: "25%", top: 0, bottom: 0 }} />
      <div className="map-road-v" style={{ left: "50%", top: 0, bottom: 0 }} />
      <div className="map-road-v" style={{ left: "75%", top: 0, bottom: 0 }} />

      {/* Blocks */}
      {MAP_BLOCKS.map(([x, y]) => (
        <div
          key={`block-${x}-${y}`}
          className="absolute rounded bg-white/20"
          style={{ left: `${x}%`, top: `${y}%`, width: "12%", height: "18%" }}
        />
      ))}

      {/* Trail */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        role="img"
        aria-label="Provider route trail"
      >
        {trail.length > 1 &&
          trail.map((p, i) => {
            if (i === 0) return null;
            const prev = trail[i - 1];
            return (
              <line
                key={`trail-${i}-${p.x}-${p.y}`}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${p.x}%`}
                y2={`${p.y}%`}
                stroke="oklch(55% 0.155 251)"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity={0.7}
              />
            );
          })}
        {trail.length > 0 && (
          <line
            key="trail-current"
            x1={`${trail[trail.length - 1].x}%`}
            y1={`${trail[trail.length - 1].y}%`}
            x2={`${pos.x}%`}
            y2={`${pos.y}%`}
            stroke="oklch(55% 0.155 251)"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity={0.7}
          />
        )}
      </svg>

      {/* Destination pin */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: "68%", top: "24%", transform: "translate(-50%, -100%)" }}
      >
        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
          <MapPin className="w-3 h-3 text-white" />
        </div>
        <div className="text-[9px] bg-white rounded px-1 mt-0.5 font-semibold text-foreground shadow">
          Your Home
        </div>
      </div>

      {/* Provider pin */}
      <div
        className="absolute transition-all duration-[1800ms] ease-in-out"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Pulse ring */}
        <div className="absolute inset-0 w-8 h-8 -m-1">
          <div
            className="absolute inset-0 rounded-full bg-orange-cta/30"
            style={{ animation: "pulse-ring 2s ease-out infinite" }}
          />
        </div>
        <div className="relative w-8 h-8 bg-orange-cta rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <Navigation className="w-4 h-4 text-white" />
        </div>
        <div className="text-[9px] bg-navy text-white rounded px-1 mt-0.5 text-center font-semibold whitespace-nowrap shadow">
          Provider
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg p-2 text-[10px] space-y-1 shadow">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-cta rounded-full" />
          <span>Provider (Live)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Your Location</span>
        </div>
      </div>
    </div>
  );
}
