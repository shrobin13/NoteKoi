interface UpcomingFeatureCardProps {
  title: string;
  description: string;
  details?: string;
}

export function UpcomingFeatureCard({ title, description, details }: UpcomingFeatureCardProps) {
  return (
    <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--ph)] text-[18px]">
          ⚡
        </div>
        <div className="space-y-0.5">
          <h2 className="text-[13px] font-semibold text-[var(--ink)]">{title}</h2>
          <p className="text-[12px] text-[var(--ink-soft)]">{description}</p>
          {details ? <p className="mt-2 text-[12px] leading-relaxed text-[var(--ink-soft)]">{details}</p> : null}
        </div>
      </div>
    </div>
  );
}
