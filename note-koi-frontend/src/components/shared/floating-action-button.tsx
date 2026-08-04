import Link from "next/link";

interface FloatingActionButtonProps {
  href: string;
}

export function FloatingActionButton({ href }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
      <Link
        href={href}
        aria-label="Upload resource"
        className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-[12px] font-semibold text-white shadow-xl transition hover:opacity-90 active:scale-[.97]"
      >
        + Upload
      </Link>
    </div>
  );
}
