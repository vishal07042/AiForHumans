export default function Home() {
  const chapters = [
    { id: "01", title: "The Big Picture", detail: "How AI systems actually fit together." },
    { id: "02", title: "Prompting", detail: "How to control style, depth, and reliability." },
    { id: "03", title: "Embeddings", detail: "How models turn meaning into vectors." },
    { id: "04", title: "Agents", detail: "Tools, memory, and multi-step workflows." },
    { id: "05", title: "Evaluation", detail: "Measure quality, not vibes." },
    { id: "06", title: "Shipping AI", detail: "From prototype to production safely." },
  ];

  const faqs = [
    {
      q: "Can I preview before buying?",
      a: "Yes. You can access a free preview with interactive demos, chapter snippets, and one challenge walkthrough.",
    },
    {
      q: "Do I need a math background?",
      a: "No. This course is built for builders and curious humans. We focus on intuition first, formulas second.",
    },
    {
      q: "Is this up to date with modern AI tools?",
      a: "Yes. The curriculum is updated around practical AI workflows, prompting, agents, evaluation, and shipping patterns.",
    },
    {
      q: "Will this help me build real products?",
      a: "Absolutely. Every chapter ends with a build challenge that mirrors real implementation decisions.",
    },
  ];

  const testimonials = [
    {
      name: "Aarav",
      quote:
        "I finally understand how prompting and agents actually work because I could see every step visually instead of just reading docs.",
    },
    {
      name: "Maya",
      quote:
        "This feels like the first AI course designed for builders. The challenge flow made concepts stick fast.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#07070a] text-zinc-100">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.15),transparent_40%)]" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10">
          <p className="mb-6 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-1 text-xs font-medium tracking-[0.14em] text-amber-300 uppercase">
            AI for Humans - Interactive Course
          </p>
          <h1 className="max-w-4xl text-5xl leading-[1.05] font-semibold tracking-tight md:text-7xl">
            Master AI by <span className="text-amber-300">playing</span>, not by memorizing.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300">
            A visual, challenge-driven AI course inspired by modern interactive learning. Learn prompts, agents,
            embeddings, and product thinking through live demos, charts, and micro-interactions.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="rounded-full bg-amber-300 px-7 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              Get Started
            </a>
            <a
              href="#chapters"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold transition hover:border-white/40"
            >
              Explore Chapters
            </a>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["10 chapters", "90+ challenges", "50 interview prompts", "Visual-first learning"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">We get it</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Learning AI can feel chaotic.</h2>
          </div>
          <div className="space-y-4 text-zinc-300">
            <p>
              You jump between random tutorials, copy prompts from social media, and still feel unsure when building
              something real.
            </p>
            <p>
              It is not your fault. Most AI content is either too shallow, too outdated, or too abstract to apply.
            </p>
            <p>
              This course is designed to fix that with one pattern: concept, visualization, challenge, then real-world
              implementation.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">Optimized for aha moments</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">Interactive first. Theory second.</h2>
            <p className="mt-5 max-w-2xl text-zinc-300">
              Each lesson introduces one concept, one visual, and one challenge. You tweak inputs and immediately see
              how behavior changes, the same way top interactive courses do.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs tracking-[0.12em] text-zinc-400 uppercase">Live preview</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#111117] p-4">
              <svg viewBox="0 0 520 210" className="h-auto w-full">
                <rect x="10" y="10" width="500" height="190" rx="14" fill="#0a0a0f" stroke="#2a2a35" />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <rect
                    key={i}
                    x={42 + i * 75}
                    y={50}
                    width="46"
                    height={120 - i * 10}
                    rx="8"
                    fill={i < 4 ? "#fbbf24" : "#60a5fa"}
                    opacity={i < 4 ? 0.9 : 0.72}
                  />
                ))}
                <text x="30" y="30" fill="#a1a1aa" fontSize="12">Token probability preview</text>
              </svg>
              <p className="mt-3 text-sm text-zinc-300">Move sliders in lessons and watch charts react in real time.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="chapters" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <h2 className="text-3xl font-semibold md:text-5xl">What you will learn</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => (
              <article
                key={chapter.id}
                className="rounded-2xl border border-white/10 bg-[#101017] p-5 transition hover:-translate-y-1 hover:border-amber-300/35"
              >
                <p className="text-xs text-zinc-400">{chapter.id}</p>
                <h3 className="mt-2 text-xl font-semibold">{chapter.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{chapter.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <h2 className="text-3xl font-semibold md:text-5xl">Built for real outcomes</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-400">Challenge system</p>
            <p className="mt-2 text-zinc-200">Practice with bite-size tasks that test understanding instantly.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-400">Interview prep</p>
            <p className="mt-2 text-zinc-200">50+ prompt and architecture questions for AI product interviews.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-zinc-400">Project portfolio</p>
            <p className="mt-2 text-zinc-200">Ship practical mini-projects and a capstone by the end.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <h2 className="text-3xl font-semibold md:text-5xl">Reviews</h2>
          <p className="mt-3 text-zinc-300">Still unsure? Here is what early learners said.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-white/10 bg-[#101017] p-6">
                <p className="text-zinc-200">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm text-zinc-400">- {item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <h2 className="text-3xl font-semibold md:text-5xl">Choose your track</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-[#0f0f14] p-6">
              <p className="text-zinc-400">Starter</p>
              <p className="mt-2 text-4xl font-semibold">$149</p>
              <p className="mt-2 text-sm text-zinc-300">Core chapters + challenges</p>
              <button className="mt-6 w-full rounded-full bg-white/10 py-3 text-sm font-semibold transition hover:bg-white/20">
                Start Starter
              </button>
            </article>
            <article className="rounded-3xl border border-amber-300/50 bg-[#14120c] p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]">
              <p className="text-amber-300">Full Course</p>
              <p className="mt-2 text-4xl font-semibold">$299</p>
              <p className="mt-2 text-sm text-zinc-200">All chapters + interview prep + capstone</p>
              <button className="mt-6 w-full rounded-full bg-amber-300 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200">
                Get Full Access
              </button>
            </article>
            <article className="rounded-3xl border border-white/10 bg-[#0f0f14] p-6">
              <p className="text-zinc-400">Team</p>
              <p className="mt-2 text-4xl font-semibold">Custom</p>
              <p className="mt-2 text-sm text-zinc-300">Progress analytics + group learning path</p>
              <button className="mt-6 w-full rounded-full bg-white/10 py-3 text-sm font-semibold transition hover:bg-white/20">
                Talk to Us
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <h2 className="text-3xl font-semibold md:text-5xl">FAQ</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-white/10 bg-white/5 p-5">
              <summary className="cursor-pointer list-none text-lg font-medium">
                {item.q}
                <span className="ml-2 text-zinc-400 group-open:hidden">+</span>
                <span className="ml-2 hidden text-zinc-400 group-open:inline">-</span>
              </summary>
              <p className="mt-3 text-zinc-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
