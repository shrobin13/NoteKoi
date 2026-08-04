"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ResourceCard } from "@/components/shared/resource-card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";
import { ResourceType } from "@/lib/types";

const categories: ResourceType[] = [
  "CLASS_NOTES",
  "LECTURE_NOTES",
  "SYLLABUS",
  "VIDEO",
  "PYQ",
  "BOOK_PDF",
];

const catLabel: Record<string, string> = {
  CLASS_NOTES: "Class Notes",
  LECTURE_NOTES: "Lecture Notes",
  SYLLABUS: "Syllabus",
  VIDEO: "Video",
  PYQ: "PYQ",
  BOOK_PDF: "Book PDF",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [includeOtherColleges, setIncludeOtherColleges] = useState(false);

  const { data } = useResourcesQuery({
    q: query,
    resourceType: selectedCategory ?? undefined,
    includeOtherColleges,
    limit: 20,
  });

  const filteredResources = data?.items ?? [];

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Search</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">
          Find resources across the platform
        </h1>
      </div>

      {/* Search controls */}
      <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 space-y-3">
        <Input
          aria-label="Search resources"
          placeholder="Search by title, description, or uploader…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                className={`rounded-[20px] border px-3 py-1 text-[11px] font-semibold transition ${
                  isSelected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]"
                }`}
              >
                {catLabel[category]}
              </button>
            );
          })}
        </div>

        {/* Include other colleges toggle */}
        <div className="border-t border-[var(--line-soft)] pt-3">
          <button
            type="button"
            onClick={() => setIncludeOtherColleges((prev) => !prev)}
            className={`flex items-center gap-2 rounded-[20px] border px-3 py-1.5 text-[11px] font-medium transition ${
              includeOtherColleges
                ? "border-[#3f6fd6] bg-[#e6ecfb] text-[#3f6fd6]"
                : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full border transition ${
                includeOtherColleges ? "border-[#3f6fd6] bg-[#3f6fd6]" : "border-[var(--line)]"
              }`}
            />
            Include other colleges
          </button>
        </div>
      </div>

      {/* Result count */}
      <p className="text-[12px] text-[var(--ink-soft)]">
        {filteredResources.length} matching resource{filteredResources.length === 1 ? "" : "s"} found
        {selectedCategory ? ` · ${catLabel[selectedCategory]}` : ""}
        {includeOtherColleges ? " · All colleges" : ""}
      </p>

      {/* Results */}
      {filteredResources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      ) : (
        <EmptyStateBlock
          title="No matching resources"
          description="Try a broader search term or remove the current category filter."
          actionText="Clear filters"
          actionHref="/search"
        />
      )}
    </section>
  );
}
