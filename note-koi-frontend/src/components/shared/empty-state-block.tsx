import Link from "next/link";
import { Card } from "@/components/ui/card";

interface EmptyStateBlockProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyStateBlock({ title, description, actionText, actionHref }: EmptyStateBlockProps) {
  return (
    <Card className="border-slate-700/80 bg-slate-900/80 p-8 text-center">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-3xl">✨</div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
        </div>
        {actionText && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
          >
            {actionText}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
