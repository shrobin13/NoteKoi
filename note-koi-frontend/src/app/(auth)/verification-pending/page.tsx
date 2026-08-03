import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerificationPendingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <Card className="space-y-6 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Verification pending</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Your account is under review</h1>
          </div>
          <p className="text-sm leading-6 text-slate-300">
            We are checking your verification status. You can still browse the platform in read-only mode while verification is pending.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary">Return to Discover</Button>
            <Button>Refresh status</Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
