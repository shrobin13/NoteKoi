import Link from "next/link";

interface EmptyStateBlockProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyStateBlock({ title, description, actionText, actionHref }: EmptyStateBlockProps) {
  return (
    <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-10 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ph)] text-2xl">
          ✨
        </div>
        <h2 className="text-[17px] font-semibold text-[var(--ink)]">{title}</h2>
        <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{description}</p>
        {actionText && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex rounded-[8px] bg-[var(--ink)] px-4 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
          >
            {actionText}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
