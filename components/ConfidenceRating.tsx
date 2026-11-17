export type Confidence = "low" | "medium" | "high";

const OPTIONS: { value: Confidence; label: string; emoji: string }[] = [
  { value: "low", label: "Guessing", emoji: "🤔" },
  { value: "medium", label: "Pretty sure", emoji: "🙂" },
  { value: "high", label: "Certain", emoji: "😎" },
];

export default function ConfidenceRating({
  value,
  onChange,
  disabled,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm text-muted">How sure are you, before you answer?</legend>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition disabled:cursor-default ${
              value === o.value
                ? "border-star bg-star/15 text-foreground"
                : "border-white/15 text-muted hover:border-white/40 hover:text-foreground"
            }`}
          >
            <span aria-hidden className="mr-1">
              {o.emoji}
            </span>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
