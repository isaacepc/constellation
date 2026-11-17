"use client";

import { useState } from "react";
import type { Dream } from "@/lib/types";
import { starState, type StarState } from "@/lib/spaced";
import { useProgress, useTimeOffset } from "@/lib/storage";
import Constellation from "./Constellation";
import ProgressBar from "./ProgressBar";

export default function DreamView({ dream }: { dream: Dream }) {
  const progress = useProgress(dream.slug);
  const offset = useTimeOffset();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Date.now() is read during render on purpose: states re-derive whenever progress/offset change.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now() + offset;
  const states: Record<string, StarState> = Object.fromEntries(
    dream.stars.map((s) => [s.id, starState(s, progress, now)]),
  );
  const litCount = Object.values(states).filter((s) => s === "lit").length;
  const selected = dream.stars.find((s) => s.id === selectedId) ?? null;
  const selectedState = selected ? states[selected.id] : null;
  const nameOf = (id: string) => dream.stars.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <ProgressBar lit={litCount} total={dream.stars.length} />
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Constellation
          stars={dream.stars}
          states={states}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <Legend />

      {selected && selectedState && (
        <section
          aria-live="polite"
          className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm"
        >
          <h2 className="text-2xl font-semibold">{selected.name}</h2>
          {selectedState === "locked" ? (
            <p className="mt-2 text-muted">
              Locked. Light{" "}
              {selected.prereqs
                .filter((p) => !(states[p] === "lit" || states[p] === "dim"))
                .map(nameOf)
                .join(" and ")}{" "}
              first.
            </p>
          ) : (
            <p className="mt-2 text-muted">
              {selectedState === "available" && "Ready to light. You'll guess first, then learn, then answer from memory."}
              {selectedState === "lit" && "Lit! It will dim later and come back for a quick review."}
              {selectedState === "dim" && "This star is dimming. A quick review will relight it."}
            </p>
          )}
          {/* StarPanel (pretest -> lesson -> quiz) plugs in here next. */}
        </section>
      )}
    </div>
  );
}

function Legend() {
  const item = (dot: React.ReactNode, label: string) => (
    <span className="flex items-center gap-2">
      {dot}
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
      {item(<span className="h-3 w-3 rounded-full bg-star shadow-[0_0_10px_#ffe9a8]" />, "Lit")}
      {item(<span className="h-3 w-3 rounded-full bg-[#cfd8ff]" />, "Ready to light")}
      {item(<span className="h-3 w-3 rounded-full bg-[#b9a46a]/60" />, "Needs review")}
      {item(<span className="h-3 w-3 rounded-full border-2 border-[#55608a] bg-[#2a3150]" />, "Locked")}
    </div>
  );
}
