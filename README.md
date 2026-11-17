# ✦ Constellation

**Live demo: https://constellation-six.vercel.app**

> *What did you want to be when you were a kid?*
> Pick that dream and Constellation turns it into a map of the skills a grown-up in that job really needs. You light up each star by **remembering, not rereading**.

Built for the mini-hackathon prompt: **"Build something that helps people learn."**

## The idea

Most learning apps start with "what do you want to learn?" Constellation starts with something more personal: **who did you want to be?** Astronaut, paleontologist, doctor, musician. Your childhood dream becomes a constellation of 8–10 stars, each one a concrete concept, connected by prerequisites. Stars unlock as you light up the ones before them, so the map shows exactly what you know, what you are ready to learn next, and what is still dark.

Six dreams are playable: 🚀 Astronaut · 🦖 Paleontologist · 🎨 Artist & Animator · 🩺 Doctor / Vet · 🎤 Musician · 💰 Entrepreneur (includes money and tax basics).

## Built on research, not vibes

Dunlosky et al. (2013), *Improving Students' Learning With Effective Learning Techniques*, reviewed ten popular study methods. Only two earned a **high utility** rating: **practice testing** and **distributed practice**. Highlighting and rereading, the most common habits, rated **low**. So Constellation has no "read more" button. You have to retrieve.

| Research finding | How Constellation uses it |
|---|---|
| Retrieval practice (the testing effect) | A star lights up only when you answer questions from memory |
| Pretesting | Every star asks a question *before* showing the lesson, so even wrong guesses help later learning |
| Spaced repetition | Lit stars fade over time and come back for review (after 1, 3, then 7 days) |
| Metacognition | You rate your confidence before each answer, so you notice what you only *feel* you know |
| Dual coding | A visual map plus short text lessons |
| Motivation and identity | Learning starts from a dream you care about, not a syllabus |

## How a star works

1. **Guess:** answer a pretest question cold.
2. **Learn:** read a short lesson (90 words or fewer, with one concrete example).
3. **Prove it:** answer 2–3 multiple-choice questions, rating your confidence on each.
4. **Light it up:** pass, and the star glows. It will dim later and ask you to review.

Star states: **locked** (grey), **ready** (pulsing), **lit** (gold), **needs review** (faded gold).

## Tech

- **Next.js** (App Router) · **TypeScript** · **Tailwind CSS**, deployed on **Vercel**
- Constellation graph drawn as **SVG** from `x`/`y` coordinates in the content files
- **Spaced repetition** scheduling in `lib/spaced.ts`; progress saved in the browser with `localStorage` (no accounts, no database)
- All lessons and quizzes are **structured JSON** in `/content`, one file per dream, written against a single schema (`lib/types.ts`). Prerequisites form a validated graph with no cycles, and every question has exactly four options.

## Run it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## What's next

- **"Your own dream" card:** an LLM generates a new constellation for any dream, using the same JSON schema the six built-in dreams already follow.
- **Teach-it-back mode:** explain a star to an AI playing your curious 8-year-old self, and let it find the gaps.
- More dreams, and a shareable picture of your lit constellation.

## Built by

Isaac Charles, with Claude (Cowork for content and planning, Claude Code for the build).
