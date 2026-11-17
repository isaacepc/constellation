import Link from "next/link";
import { notFound } from "next/navigation";
import { dreams, getDream } from "@/lib/dreams";
import DreamView from "@/components/DreamView";

export function generateStaticParams() {
  return dreams.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dream = getDream(slug);
  return { title: dream ? `${dream.title} · Constellation` : "Constellation" };
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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-8">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← All dreams
      </Link>
      <header className="mt-6 mb-6 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          <span aria-hidden>{dream.emoji}</span> {dream.title}
        </h1>
        <p className="mt-3 text-lg text-muted">&ldquo;{dream.tagline}&rdquo;</p>
        <p className="mt-2 text-sm text-muted">
          Tap a glowing star to start. Each one unlocks the stars it points to.
        </p>
      </header>
      <DreamView dream={dream} />
    </main>
  );
}
