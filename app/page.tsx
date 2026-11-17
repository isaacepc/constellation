import Link from "next/link";
import { dreams } from "@/lib/dreams";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-14 sm:px-8 sm:py-20">
      <header className="mb-12 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-star">
          ✦ Constellation ✦
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          What did you want to be
          <br className="hidden sm:block" /> when you were a kid?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted sm:text-xl">
          Pick a dream. We&apos;ll map the skills a grown-up in that job really
          uses. You light up each star by remembering, not rereading.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dreams.map((dream) => (
          <li key={dream.slug}>
            <Link
              href={`/dream/${dream.slug}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-star/60 hover:bg-white/[0.07] hover:shadow-[0_0_30px_-6px_rgba(255,233,168,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-star"
            >
              <span className="text-5xl" aria-hidden>
                {dream.emoji}
              </span>
              <span className="text-2xl font-semibold">{dream.title}</span>
              <span className="text-base leading-relaxed text-muted">
                &ldquo;{dream.tagline}&rdquo;
              </span>
              <span className="mt-auto pt-2 text-sm font-medium text-star opacity-80 transition group-hover:opacity-100">
                Explore the constellation →
              </span>
            </Link>
          </li>
        ))}

        <li>
          <div
            aria-disabled
            className="flex h-full flex-col gap-3 rounded-2xl border border-dashed border-white/15 p-6 text-muted"
          >
            <span className="text-5xl opacity-70" aria-hidden>
              ✨
            </span>
            <span className="text-2xl font-semibold text-foreground/80">
              Your own dream
            </span>
            <span className="text-base leading-relaxed">
              Type any job and get a constellation made just for you.
            </span>
            <span className="mt-auto pt-2 text-sm font-medium uppercase tracking-wider">
              Coming soon
            </span>
          </div>
        </li>
      </ul>

      <footer className="mt-14 text-center text-sm text-muted">
        Built on the learning science: practice testing and spaced practice
        were the only two study techniques rated{" "}
        <span className="text-foreground">high utility</span> (Dunlosky et al.,
        2013).
      </footer>
    </main>
  );
}
