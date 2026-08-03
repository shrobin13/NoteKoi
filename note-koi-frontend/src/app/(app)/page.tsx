import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Discover</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Core layout and navigation are ready. This dashboard is the starting point for resource browsing and activity cards.
        </p>
      </div>
      <UpcomingFeatureCard
        title="Discover Hub"
        description="Search, browse, and manage resources from the unified platform."
        details="The app shell, sidebar, bottom nav, and command palette are scaffolded for Milestone 1."
      />
    </section>
  );
}
