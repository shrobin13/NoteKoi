import { Card } from "@/components/ui/card";

interface UpcomingFeatureCardProps {
  title: string;
  description: string;
  details?: string;
}

export function UpcomingFeatureCard({ title, description, details }: UpcomingFeatureCardProps) {
  return (
    <Card className="border-slate-700/80 bg-slate-900/80 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-slate-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-xl">⚡</div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
        </div>
        {details ? <p className="text-sm leading-6 text-slate-300">{details}</p> : null}
      </div>
    </Card>
  );
}
