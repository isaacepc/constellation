// Source of truth for the content schema (see CLAUDE.md).
// Content authors and app code both depend on this. Do not change it without updating both.

export type Dream = {
  slug: string; // "astronaut"
  title: string; // "Astronaut"
  emoji: string; // "🚀"
  tagline: string; // one sentence, kid-voice friendly
  stars: Star[]; // 8-10 per dream
};

export type Star = {
  id: string; // unique within dream, kebab-case
  name: string; // "Orbital Mechanics"
  prereqs: string[]; // ids of stars that must be lit first ([] for roots)
  x: number; // 0-100 layout position
  y: number; // 0-100 layout position
  pretest: string; // one question asked BEFORE the lesson
  lesson: string; // <= 90 words, plain language, one concrete example
  quiz: Question[]; // 2-3 multiple-choice questions
};

export type Question = {
  q: string;
  options: string[]; // exactly 4
  answer: number; // index into options
  why: string; // 1-2 sentence explanation shown after answering
};
