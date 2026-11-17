"use client";

import type { Star } from "@/lib/types";
import type { StarState } from "@/lib/spaced";

// The JSON is the contract: x/y (0-100) are mapped linearly into this canvas, never re-laid-out.
// If a layout looks cramped, nudge the coordinates in /content instead.
const W = 1000;
const H = 760;
const PAD_X = 110; // room for labels at the edges
const PAD_Y = 60;

const px = (x: number) => PAD_X + (x / 100) * (W - 2 * PAD_X);
const py = (y: number) => PAD_Y + (y / 100) * (H - 2 * PAD_Y - 30); // leave room for label under bottom row

type Props = {
  stars: Star[];
  states: Record<string, StarState>;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const STATE_LABEL: Record<StarState, string> = {
  locked: "locked",
  available: "ready to light",
  lit: "lit",
  dim: "dimming, ready for review",
};

export default function Constellation({ stars, states, selectedId, onSelect }: Props) {
  const byId = new Map(stars.map((s) => [s.id, s]));
  const learned = (id: string) => states[id] === "lit" || states[id] === "dim";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full min-w-[640px] select-none"
      role="group"
      aria-label="Skill constellation"
    >
      <defs>
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="litFill">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#f5b942" />
        </radialGradient>
      </defs>

      {/* Edges: prereq -> star */}
      <g>
        {stars.flatMap((s) =>
          s.prereqs.map((pid) => {
            const p = byId.get(pid);
            if (!p) return null;
            const both = learned(pid) && learned(s.id);
            const half = learned(pid) && !both;
            return (
              <line
                key={`${pid}->${s.id}`}
                x1={px(p.x)}
                y1={py(p.y)}
                x2={px(s.x)}
                y2={py(s.y)}
                stroke={both ? "#ffe9a8" : "#8fa0d8"}
                strokeOpacity={both ? 0.7 : half ? 0.45 : 0.18}
                strokeWidth={both ? 3 : 2}
                strokeDasharray={both ? undefined : "6 8"}
              />
            );
          }),
        )}
      </g>

      {/* Stars */}
      {stars.map((s) => {
        const state = states[s.id] ?? "locked";
        const cx = px(s.x);
        const cy = py(s.y);
        const selected = s.id === selectedId;
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`${s.name}, ${STATE_LABEL[state]}`}
            aria-pressed={selected}
            className={`cursor-pointer outline-none star-${state}`}
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(s.id);
              }
            }}
          >
            {/* big invisible hit target for touch / projector clicking */}
            <circle cx={cx} cy={cy} r={44} fill="transparent" />

            {selected && (
              <circle cx={cx} cy={cy} r={34} fill="none" stroke="#ffe9a8" strokeWidth={2} strokeOpacity={0.8} />
            )}

            {state === "lit" && (
              <circle cx={cx} cy={cy} r={20} fill="url(#litFill)" filter="url(#glow)" />
            )}
            {state === "dim" && (
              <circle cx={cx} cy={cy} r={18} fill="#b9a46a" fillOpacity={0.55} stroke="#ffe9a8" strokeOpacity={0.5} strokeWidth={2} />
            )}
            {state === "available" && (
              <>
                <circle className="star-pulse" cx={cx} cy={cy} r={22} fill="none" stroke="#cfd8ff" strokeWidth={2} />
                <circle cx={cx} cy={cy} r={14} fill="#cfd8ff" />
              </>
            )}
            {state === "locked" && (
              <circle cx={cx} cy={cy} r={12} fill="#2a3150" stroke="#55608a" strokeWidth={2} />
            )}

            <text
              x={cx}
              y={cy + 50}
              textAnchor="middle"
              fontSize={24}
              fontWeight={state === "locked" ? 400 : 600}
              fill={state === "locked" ? "#6f7aa3" : state === "dim" ? "#cdbf94" : "#f1f5ff"}
              style={{ paintOrder: "stroke" }}
              stroke="#050816"
              strokeWidth={6}
            >
              {s.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
