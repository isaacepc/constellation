"use client";

import { useState } from "react";
import type { Star } from "@/lib/types";
import type { StarRecord } from "@/lib/spaced";
import ConfidenceRating, { type Confidence } from "./ConfidenceRating";

type Step = "pretest" | "lesson" | "quiz" | "result";

type Answer = { picked: number; correct: boolean; confidence: Confidence };

/** Pass if every answer is right, or at least 2/3 of them. */
export const passed = (answers: Answer[]) =>
  answers.length > 0 && answers.filter((a) => a.correct).length / answers.length >= 2 / 3;

export default function StarPanel({
  star,
  review,
  onPass,
  onClose,
}: {
  star: Star;
  /** Reviewing a dimmed star: skip straight to retrieval. */
  review: boolean;
  onPass: () => StarRecord;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(review ? "quiz" : "pretest");
  const [guess, setGuess] = useState("");
  const [qi, setQi] = useState(0);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [nextReview, setNextReview] = useState<StarRecord | null>(null);

  const q = star.quiz[qi];
  const revealed = picked !== null;

  function pick(i: number) {
    if (revealed || !confidence) return;
    setPicked(i);
    setAnswers((a) => [...a, { picked: i, correct: i === q.answer, confidence }]);
  }

  function next() {
    if (qi + 1 < star.quiz.length) {
      setQi(qi + 1);
      setPicked(null);
      setConfidence(null);
      return;
    }
    if (passed(answers)) setNextReview(onPass());
    setStep("result");
  }

  function retry() {
    setQi(0);
    setPicked(null);
    setConfidence(null);
    setAnswers([]);
    setStep(review ? "quiz" : "lesson");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-star">
            {review ? "Review" : STEP_LABEL[step]}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{star.name}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg px-2 py-1 text-xl text-muted hover:bg-white/10 hover:text-foreground"
        >
          ×
        </button>
      </div>

      {!review && <Steps step={step} />}

      {step === "pretest" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("lesson");
          }}
        >
          <p className="text-lg leading-relaxed">{star.pretest}</p>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted">
              Take a guess before you learn it. Wrong guesses still help you remember.
            </span>
            <textarea
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              rows={3}
              placeholder="My guess…"
              className="rounded-xl border border-white/15 bg-black/30 p-3 text-base placeholder:text-muted/60 focus:border-star focus:outline-none"
            />
          </label>
          <PrimaryButton type="submit">{guess.trim() ? "Lock in my guess" : "I have no idea, show me"}</PrimaryButton>
        </form>
      )}

      {step === "lesson" && (
        <div className="flex flex-col gap-4">
          {guess.trim() && (
            <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-muted">
              <span className="font-medium text-foreground">Your guess:</span> {guess}
            </p>
          )}
          <p className="text-lg leading-relaxed">{star.lesson}</p>
          <p className="text-sm text-muted">
            Next you&apos;ll answer from memory, so the lesson will be hidden.
          </p>
          <PrimaryButton onClick={() => setStep("quiz")}>I&apos;m ready, quiz me</PrimaryButton>
        </div>
      )}

      {step === "quiz" && q && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Question {qi + 1} of {star.quiz.length}
          </p>
          <p className="text-lg font-medium leading-relaxed">{q.q}</p>

          <ConfidenceRating value={confidence} onChange={setConfidence} disabled={revealed} />

          <ul className="flex flex-col gap-2" aria-label="Answer options">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isPicked = i === picked;
              const style = !revealed
                ? confidence
                  ? "border-white/15 hover:border-star/70 hover:bg-white/[0.06]"
                  : "border-white/10 opacity-50 cursor-not-allowed"
                : isAnswer
                  ? "border-emerald-400 bg-emerald-400/15"
                  : isPicked
                    ? "border-rose-400 bg-rose-400/15"
                    : "border-white/10 opacity-50";
              return (
                <li key={i}>
                  <button
                    onClick={() => pick(i)}
                    disabled={revealed || !confidence}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-base transition ${style}`}
                  >
                    <span className="mt-0.5 font-mono text-sm text-muted">{"ABCD"[i]}</span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isAnswer && <span aria-label="correct">✓</span>}
                    {revealed && isPicked && !isAnswer && <span aria-label="incorrect">✗</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {!confidence && !revealed && (
            <p className="text-sm text-muted">Pick how sure you are to unlock the answers.</p>
          )}

          {revealed && (
            <div aria-live="polite" className="flex flex-col gap-4">
              <p className="rounded-xl bg-black/25 p-3 leading-relaxed">
                <span className={`font-semibold ${picked === q.answer ? "text-emerald-300" : "text-rose-300"}`}>
                  {picked === q.answer ? "Correct. " : "Not quite. "}
                </span>
                {q.why}
              </p>
              <PrimaryButton onClick={next}>
                {qi + 1 < star.quiz.length ? "Next question" : "See results"}
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {step === "result" && (
        <Result
          answers={answers}
          didPass={passed(answers)}
          review={review}
          nextReview={nextReview}
          onRetry={retry}
          onClose={onClose}
        />
      )}
    </div>
  );
}

const STEP_LABEL: Record<Step, string> = {
  pretest: "Step 1 · Guess first",
  lesson: "Step 2 · Learn",
  quiz: "Step 3 · Remember",
  result: "Result",
};

function Steps({ step }: { step: Step }) {
  const order: Step[] = ["pretest", "lesson", "quiz"];
  const idx = step === "result" ? 3 : order.indexOf(step);
  return (
    <div className="flex gap-1.5" aria-hidden>
      {order.map((s, i) => (
        <div key={s} className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-star" : "bg-white/10"}`} />
      ))}
    </div>
  );
}

function Result({
  answers,
  didPass,
  review,
  nextReview,
  onRetry,
  onClose,
}: {
  answers: Answer[];
  didPass: boolean;
  review: boolean;
  nextReview: StarRecord | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  const right = answers.filter((a) => a.correct).length;
  const sureWrong = answers.filter((a) => !a.correct && a.confidence === "high").length;
  const unsureRight = answers.filter((a) => a.correct && a.confidence === "low").length;
  const days = nextReview ? [1, 3, 7][nextReview.box - 1] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <div className="text-5xl" aria-hidden>
          {didPass ? "🌟" : "🌑"}
        </div>
        <p className="mt-2 text-2xl font-semibold">
          {didPass ? (review ? "Relit!" : "Star lit!") : "Not lit yet"}
        </p>
        <p className="mt-1 text-muted">
          {right} of {answers.length} from memory
        </p>
      </div>

      {(sureWrong > 0 || unsureRight > 0) && (
        <div className="rounded-xl bg-black/25 p-3 text-sm leading-relaxed">
          <p className="mb-1 font-medium">How well did you know what you knew?</p>
          {sureWrong > 0 && (
            <p className="text-muted">
              You felt certain on {sureWrong} you missed. Those are worth a second look; confident mistakes stick.
            </p>
          )}
          {unsureRight > 0 && (
            <p className="text-muted">
              You guessed on {unsureRight} you got right. You know more than you think.
            </p>
          )}
        </div>
      )}

      {didPass && days && (
        <p className="text-center text-sm text-muted">
          It will dim in {days} day{days > 1 ? "s" : ""} and come back for review. Spacing it out is what makes it stick.
        </p>
      )}

      {didPass ? (
        <PrimaryButton onClick={onClose}>Back to the constellation</PrimaryButton>
      ) : (
        <>
          <p className="text-center text-sm text-muted">
            You need {Math.ceil((answers.length * 2) / 3)} of {answers.length} to light it. Retrieval that feels hard is still working.
          </p>
          <PrimaryButton onClick={onRetry}>{review ? "Try again" : "Reread the lesson and try again"}</PrimaryButton>
        </>
      )}
    </div>
  );
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-xl bg-star px-5 py-3 text-base font-semibold text-[#1a1530] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-star disabled:opacity-50"
    />
  );
}
