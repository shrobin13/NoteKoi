"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  "BOOK_PDF"
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data } = useResourcesQuery({ q: query, resourceType: selectedCategory ?? undefined, limit: 20 });

  const filteredResources = useMemo(
    () => {
      const currentResources = data?.items ?? [];
      return currentResources.filter((resource) => {
        const uploaderLabel =
          typeof resource.uploader === "string"
            ? resource.uploader
            : resource.uploader.name ?? resource.uploader.id;

        const matchesQuery =
          query.trim().length === 0 ||
          [resource.title, resource.description, uploaderLabel, resource.type]
            .some((value) => value.toLowerCase().includes(query.trim().toLowerCase()));

        const matchesCategory =
          !selectedCategory || resource.type === selectedCategory;

        return matchesQuery && matchesCategory;
      });
    },
    [query, selectedCategory, data?.items]
  );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Search</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Find resources across the platform</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Search by title, description, uploader, or resource type. Filter results instantly as you type.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
            <Input
              aria-label="Search resources"
              placeholder="Search resources, titles, or uploaders"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    variant={isSelected ? "secondary" : "ghost"}
                    className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em]"
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                  >
                    {category.replace("_", " ")}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6 text-sm text-slate-300">
            <p className="font-semibold text-white">Search results</p>
            <p className="mt-2">
              {filteredResources.length} matching resource{filteredResources.length === 1 ? "" : "s"} found.
            </p>
            {selectedCategory ? (
              <p className="mt-3 text-slate-400">Filtered by type: {selectedCategory.replace("_", " ")}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          {filteredResources.length > 0 ? (
            <div className="grid gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
            </div>
          ) : (
            <EmptyStateBlock
              title="No matching resources"
              description="Try a broader search term or remove the current category filter to see more resources."
              actionText="Clear filters"
              actionHref="/search"
            />
          )}
        </div>
      </div>
    </section>
  );
}
