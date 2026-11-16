# CLAUDE.md — Constellation

> Hackathon prompt: **"Build something that helps people learn."**
> Time box: **45 minutes to build AND deploy to Vercel.** Ship early, polish later.
> Judging: **Functionality** (does it work?) · **Creativity** (is it novel?) · **Ambition** (did you aim high?) · **Technical difficulty** (how hard was it?)

## What we're building

**Constellation** — start from *"What did you want to be as a kid?"* Pick a childhood dream (astronaut, paleontologist, …) and get a **skill constellation**: a visual graph of the 8–10 concepts an adult in that role actually needs. Each star is unlocked by **retrieving** knowledge, not rereading it. Answer from memory and the star lights up. Lit stars slowly dim and come back for review (spaced repetition).

Pitch in one line: *"Research says rereading and highlighting are weak. Constellation makes you retrieve instead, and turns your childhood dream into a map you can light up."*

## Research we are building on (reference in UI + demo)

Dunlosky et al. (2013), "Improving Students' Learning With Effective Learning Techniques": practice testing and distributed practice were the only two techniques rated **high utility**; highlighting and rereading rated **low**.

| Principle | Where it shows up in the app |
|---|---|
| Retrieval practice (testing effect) | Every star is unlocked by answering from memory |
| Pretesting | Ask the question BEFORE showing the lesson; wrong guesses still help |
| Spacing | Lit stars dim over time (Leitner boxes) and return for review |
| Dual coding | Visual constellation + short text lesson |
| Metacognition | "How sure are you?" rating before revealing the answer |
| Motivation / identity | Start from the childhood dream, not a syllabus |

## Stack (keep it boring, ship fast)

- **Next.js (App Router) + TypeScript + Tailwind CSS**
- **No database, no auth.** Progress lives in `localStorage`.
- Constellation graph: plain **SVG** with hand-set or radial positions (no heavy graph libs unless there is spare time).
- Content is **static JSON** in `/content`, authored ahead of time. No LLM is needed for v1.
- Deploy: **GitHub → Vercel** (auto-deploy on push to `main`).
- Stretch only: LLM "Your own dream" card via Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) in `/app/api/constellation/route.ts`. Key goes in the `ANTHROPIC_API_KEY` Vercel env var, never in client code.

## Repo layout

```
/app
  page.tsx                  # landing: "What did you want to be?" with 6 dream cards
  /dream/[slug]/page.tsx    # constellation view for one dream
/components
  Constellation.tsx         # SVG graph, stars, edges, lit/dim states
  StarPanel.tsx             # pretest -> lesson -> quiz flow for one star
  ConfidenceRating.tsx
  ProgressBar.tsx
/lib
  types.ts                  # schema below (source of truth)
  storage.ts                # localStorage read/write
  spaced.ts                 # Leitner scheduling + dimming
  dreams.ts                 # loads /content/*.json
/content
  astronaut.json  paleontologist.json  artist.json
  doctor.json  musician.json  entrepreneur.json
CLAUDE.md
README.md
```

## Data contract (source of truth: `/lib/types.ts`)

Content authors and app code both depend on this. **Do not change it without updating both.**

```ts
export type Dream = {
  slug: string;            // "astronaut"
  title: string;           // "Astronaut"
  emoji: string;           // "🚀"
  tagline: string;         // one sentence, kid-voice friendly
  stars: Star[];           // 8-10 per dream
};

export type Star = {
  id: string;              // unique within dream, kebab-case
  name: string;            // "Orbital Mechanics"
  prereqs: string[];       // ids of stars that must be lit first ([] for roots)
  x: number;               // 0-100 layout position
  y: number;               // 0-100 layout position
  pretest: string;         // one question asked BEFORE the lesson
  lesson: string;          // <= 90 words, plain language, one concrete example
  quiz: Question[];        // 2-3 multiple-choice questions
};

export type Question = {
  q: string;
  options: string[];       // exactly 4
  answer: number;          // index into options
  why: string;             // 1-2 sentence explanation shown after answering
};
```

## UX flow (one star)

1. Click a star (only available if all prereqs are lit).
2. **Pretest:** show `pretest`, free guess, then reveal. No grading.
3. **Lesson:** show `lesson`.
4. **Quiz:** for each question, user rates confidence (low / medium / high), answers, sees `why`.
5. Pass (all correct, or >= 2/3) => star **lights up**; schedule next review (Leitner box 1 => 1 day, box 2 => 3 days, box 3 => 7 days; for the demo include a "fast-forward time" dev toggle so dimming is visible).
6. Progress counter on the page: "7 / 10 stars lit".

## Content authoring rules

- Teach what an adult in that role genuinely needs, not trivia.
- Lessons <= 90 words. Quiz questions test understanding, not recall of wording.
- Distractors must be plausible. Exactly 4 options. `answer` is the correct index; vary it.
- Each dream: 8–10 stars, a sensible prereq graph (a few roots, a few merges, one or two "capstone" stars).
- **Entrepreneur** constellation must cover finance and tax basics (profit vs cash flow, pricing/margin, self-employment taxes, budgeting, etc.) since "profitable skills" is a goal.
- Tone: warm, curious, a bit playful. Never condescending.

## Design direction

- Dark "night sky" background, soft glow on lit stars, dim/gray for locked, pulsing for available.
- Large, tappable stars; readable on a projector. High contrast text.
- Landing page: 6 dream cards in a grid + a locked 7th card "✨ Your own dream (coming soon)".
- Keep it uncluttered. One clear action per screen.

## Build order and time boxes (45 min total)

| Min | Goal |
|---|---|
| 0–5 | Scaffold Next.js, push to GitHub, **import into Vercel and deploy hello-world first** |
| 5–15 | Types, landing page, load JSON, render constellation for one dream |
| 15–30 | StarPanel flow (pretest, lesson, quiz, confidence), light up, localStorage |
| 30–40 | Spaced repetition dimming, progress bar, remaining dreams wired up, polish |
| 40–45 | Final deploy, test the live URL on a second device, rehearse demo |

If behind schedule, cut in this order: confidence ratings -> fast-forward toggle -> extra dreams (keep >= 3). **Never cut a working deploy.**

## Definition of done

- Live Vercel URL loads with no errors.
- At least 3 dreams fully playable; target 6.
- A star can be completed end-to-end and persists across refresh.
- Dimming/review visible in the demo.
- README has the one-line pitch, the research table, and the live URL.

## Rules for Claude

- Commit small and often; push to `main` (Vercel auto-deploys). Don't leave `main` broken.
- Prefer the simplest thing that works. No new dependencies without a strong reason.
- Never commit secrets. `.env*` stays in `.gitignore`.
- Run `npm run build` before pushing anything non-trivial.
- Don't invent facts in lessons. If unsure about a detail, simplify the lesson.
- Don't add features outside this file without asking.

## Stretch (only if everything above is done and live)

1. "Your own dream" card: API route returns a `Dream` JSON matching the schema above (use AI SDK `generateObject` with a Zod schema, one retry, fall back to a cached dream on failure).
2. Share card / screenshot of your lit constellation.
3. "Teach it back" mode: explain a star in your own words (needs the LLM).

## Demo script (3 minutes, mapped to the rubric)

1. **Hook (20s):** "What did you want to be when you were 8?" Pick a card live.
2. **Functionality (60s):** Open a star, pretest, lesson, quiz, watch it light up.
3. **Research (40s):** Show the Dunlosky table; "this is why there's no 'read more' button."
4. **Ambition and technical (40s):** Prerequisite graph, spaced-repetition dimming (fast-forward toggle), schema designed so an LLM can generate new dreams.
5. **Close (20s):** "Next: any dream, generated on demand."
