import type { Star } from "./types";

// Leitner boxes: box 1 => review in 1 day, box 2 => 3 days, box 3 => 7 days.
export const BOX_INTERVAL_DAYS = [1, 3, 7] as const;
export const DAY_MS = 24 * 60 * 60 * 1000;

export type StarRecord = {
  box: 1 | 2 | 3;
  due: number; // epoch ms when the star dims and needs review
};

export type Progress = Record<string, StarRecord>;

export type StarState = "locked" | "available" | "lit" | "dim";

/** A star counts as learned (and unlocks its children) once it has a record, even if dim. */
export function isLearned(progress: Progress, id: string): boolean {
  return id in progress;
}

export function starState(star: Star, progress: Progress, now: number): StarState {
  const rec = progress[star.id];
  if (rec) return now >= rec.due ? "dim" : "lit";
  return star.prereqs.every((p) => isLearned(progress, p)) ? "available" : "locked";
}

/** Next record after passing a star (first time or on review). */
export function promote(rec: StarRecord | undefined, now: number): StarRecord {
  const box = (rec ? Math.min(rec.box + 1, 3) : 1) as StarRecord["box"];
  return { box, due: now + BOX_INTERVAL_DAYS[box - 1] * DAY_MS };
}

/** Failing a review drops the star back to box 1. */
export function demote(now: number): StarRecord {
  return { box: 1, due: now + BOX_INTERVAL_DAYS[0] * DAY_MS };
}
