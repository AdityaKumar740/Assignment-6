import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-125px)] w-[calc(100%-32px)] max-w-[1180px] flex-1 place-items-center py-12 text-center">
      <section className="flex max-w-lg flex-col items-center">
        <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#ccff00]">404 / NOT FOUND</span>
        <h1 className="mb-2 mt-3 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-4xl uppercase">This page missed a rep.</h1>
        <p className="mb-6 mt-0 text-sm text-[#888d97]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link className="inline-flex min-h-[36px] items-center justify-center rounded-full bg-[#ccff00] px-5 text-xs font-extrabold text-[#101207] transition-colors hover:bg-[#e0ff59]" href="/">
          Back to workouts
        </Link>
      </section>
    </main>
  );
}