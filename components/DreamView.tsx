"use client";

import { useEffect, useRef, useState } from "react";
import type { Dream } from "@/lib/types";
import { DAY_MS, promote, starState, type StarState } from "@/lib/spaced";
import { addTimeOffset, resetProgress, saveStar, useProgress, useTimeOffset } from "@/lib/storage";
import Constellation from "./Constellation";
import ProgressBar from "./ProgressBar";
import StarPanel from "./StarPanel";

export default function DreamView({ dream }: { dream: Dream }) {
  const progress = useProgress(dream.slug);
  const offset = useTimeOffset();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Snapshot of the state when the star was opened, so a just-lit star keeps showing its result.
  const [openedAs, setOpenedAs] = useState<StarState | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Date.now() is read during render on purpose: states re-derive whenever progress/offset change.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now() + offset;
  const states: Record<string, StarState> = Object.fromEntries(
    dream.stars.map((s) => [s.id, starState(s, progress, now)]),
  );
  const litCount = Object.values(states).filter((s) => s === "lit").length;
  const dimCount = Object.values(states).filter((s) => s === "dim").length;
  const selected = dream.stars.find((s) => s.id === selectedId) ?? null;
  const nameOf = (id: string) => dream.stars.find((s) => s.id === id)?.name ?? id;

  function select(id: string) {
    setSelectedId(id);
    setOpenedAs(states[id]);
  }
  function close() {
    setSelectedId(null);
    setOpenedAs(null);
  }

  // On narrow screens the panel sits below the map; bring it into view when a star is picked.
  useEffect(() => {
    if (selectedId) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <ProgressBar lit={litCount} total={dream.stars.length} />
        {dimCount > 0 && (
          <p className="text-sm text-[#cdbf94]">
            {dimCount} star{dimCount > 1 ? "s are" : " is"} dimming. Tap to review.
          </p>
        )}
      </div>

      <div className={`grid items-start gap-6 ${selected ? "lg:grid-cols-[minmax(0,1fr)_400px]" : ""}`}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Constellation
            stars={dream.stars}
            states={states}
            selectedId={selectedId}
            onSelect={select}
          />
        </div>

        {selected && openedAs && (
          <aside
            ref={panelRef}
            className="w-full scroll-mt-4 rounded-2xl border border-white/10 bg-[#0b1028]/85 p-6 backdrop-blur-md lg:sticky lg:top-6"
          >
            {openedAs === "locked" ? (
              <LockedMessage
                name={selected.name}
                missing={selected.prereqs.filter((p) => states[p] === "locked" || states[p] === "available").map(nameOf)}
                onClose={close}
              />
            ) : openedAs === "lit" ? (
              <LitMessage name={selected.name} due={progress[selected.id]?.due} now={now} onClose={close} />
            ) : (
              <StarPanel
                key={selected.id}
                star={selected}
                review={openedAs === "dim"}
                onPass={() => {
                  const rec = promote(progress[selected.id], now);
                  saveStar(dream.slug, selected.id, rec);
                  return rec;
                }}
                onClose={close}
              />
            )}
          </aside>
        )}
      </div>

      <Legend />
      <DemoControls slug={dream.slug} offsetDays={Math.round(offset / DAY_MS)} />
    </div>
  );
}

function LockedMessage({ name, missing, onClose }: { name: string; missing: string[]; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">{name}</h2>
      <p className="text-muted">
        🔒 Locked. Light <span className="text-foreground">{missing.join(" and ")}</span> first. Each star builds on the
        ones that point to it.
      </p>
      <button onClick={onClose} className="self-start text-sm text-muted underline hover:text-foreground">
        Close
      </button>
    </div>
  );
}

function LitMessage({ name, due, now, onClose }: { name: string; due?: number; now: number; onClose: () => void }) {
  const days = due ? Math.max(1, Math.ceil((due - now) / DAY_MS)) : null;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">🌟 {name}</h2>
      <p className="text-muted">
        Lit! {days && `It will dim in about ${days} day${days > 1 ? "s" : ""}, then come back for a quick review.`} No
        rereading needed. Coming back later to remember it is what makes it last.
      </p>
      <button onClick={onClose} className="self-start text-sm text-muted underline hover:text-foreground">
        Close
      </button>
    </div>
  );
}

function DemoControls({ slug, offsetDays }: { slug: string; offsetDays: number }) {
  const btn =
    "rounded-lg border border-white/15 px-3 py-1.5 text-sm text-muted transition hover:border-white/40 hover:text-foreground";
  return (
    <details className="mx-auto w-full max-w-xl rounded-xl border border-white/10 px-4 py-3 text-sm text-muted">
      <summary className="cursor-pointer select-none">⏩ Demo: fast-forward time</summary>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btn} onClick={() => addTimeOffset(DAY_MS)}>
          +1 day
        </button>
        <button className={btn} onClick={() => addTimeOffset(3 * DAY_MS)}>
          +3 days
        </button>
        <button className={btn} onClick={() => addTimeOffset(7 * DAY_MS)}>
          +1 week
        </button>
        <button className={btn} onClick={() => addTimeOffset(-offsetDays * DAY_MS)} disabled={offsetDays === 0}>
          Back to today
        </button>
        <button
          className={`${btn} ml-auto hover:border-rose-400/60 hover:text-rose-300`}
          onClick={() => {
            if (window.confirm("Reset all progress for this dream?")) resetProgress(slug);
          }}
        >
          Reset progress
        </button>
      </div>
      <p className="mt-2">
        {offsetDays === 0 ? "Running on real time." : `Pretending it's ${offsetDays} day${offsetDays > 1 ? "s" : ""} from now.`}{" "}
        Lit stars dim when their review is due (after 1, then 3, then 7 days).
      </p>
    </details>
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
