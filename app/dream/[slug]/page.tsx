import Link from "next/link";
import { notFound } from "next/navigation";
import { dreams, getDream } from "@/lib/dreams";

export function generateStaticParams() {
  return dreams.map((d) => ({ slug: d.slug }));
}

export default async function DreamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dream = getDream(slug);
  if (!dream) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-8">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← All dreams
      </Link>
      <div className="mt-10 text-center">
        <span className="text-6xl" aria-hidden>
          {dream.emoji}
        </span>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{dream.title}</h1>
        <p className="mt-3 text-lg text-muted">&ldquo;{dream.tagline}&rdquo;</p>
        <p className="mt-12 text-muted">Your constellation is being charted…</p>
      </div>
    </main>
  );
}
