"use client";

import { useSyncExternalStore } from "react";
import type { Progress, StarRecord } from "./spaced";

// All progress lives in localStorage. No server, no auth.
const progressKey = (slug: string) => `constellation:v1:progress:${slug}`;
const OFFSET_KEY = "constellation:v1:timeOffset"; // dev "fast-forward time" in ms

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or storage full: progress just won't persist.
  }
  emit();
}

// Cache parsed snapshots by raw string so useSyncExternalStore gets stable references.
const EMPTY: Progress = {};
const parsedCache = new Map<string, { raw: string | null; value: Progress }>();

function getProgressSnapshot(slug: string): Progress {
  const raw = readRaw(progressKey(slug));
  const hit = parsedCache.get(slug);
  if (hit && hit.raw === raw) return hit.value;
  let value = EMPTY;
  if (raw) {
    try {
      value = JSON.parse(raw) as Progress;
    } catch {
      value = EMPTY;
    }
  }
  parsedCache.set(slug, { raw, value });
  return value;
}

export function useProgress(slug: string): Progress {
  return useSyncExternalStore(
    subscribe,
    () => getProgressSnapshot(slug),
    () => EMPTY,
  );
}

export function saveStar(slug: string, id: string, rec: StarRecord) {
  const next = { ...getProgressSnapshot(slug), [id]: rec };
  writeRaw(progressKey(slug), JSON.stringify(next));
}

export function resetProgress(slug: string) {
  writeRaw(progressKey(slug), JSON.stringify({}));
}

function getOffsetSnapshot(): number {
  return Number(readRaw(OFFSET_KEY)) || 0;
}

export function useTimeOffset(): number {
  return useSyncExternalStore(subscribe, getOffsetSnapshot, () => 0);
}

export function addTimeOffset(ms: number) {
  writeRaw(OFFSET_KEY, String(getOffsetSnapshot() + ms));
}
