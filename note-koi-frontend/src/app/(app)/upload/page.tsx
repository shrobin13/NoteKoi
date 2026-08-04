"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadResourceMutation } from "@/hooks/useUploadResourceMutation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDepartmentsQuery } from "@/hooks/useDepartmentsQuery";
import { useCoursesQuery } from "@/hooks/useCoursesQuery";
import { useSessionsQuery } from "@/hooks/useSessionsQuery";
import { patchMetadata } from "@/lib/api/resources";
import { getErrorMessage } from "@/lib/utils";
import { ResourceType, User, Visibility } from "@/lib/types";

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--ink-soft)]">Loading…</div>}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadPageContent() {
  const { user, isLoading, error } = useRequireAuth();
  const searchParams = useSearchParams();
  const versionOfId = searchParams.get("versionOf");
  const editId = searchParams.get("editId");

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="h-80 animate-pulse" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="p-8 text-center">
          <p className="text-[var(--ink-soft)]">Please sign in to upload resources.</p>
        </Card>
      </section>
    );
  }

  if (editId) {
    return <EditMetadataForm resourceId={editId} />;
  }

  return <UploadWizard user={user} versionOfId={versionOfId} />;
}

// ─── Edit Metadata Form ──────────────────────────────────────────────────────

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

function EditMetadataForm({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: EditFormData) =>
      patchMetadata(resourceId, {
        title: data.title.trim(),
        description: data.description?.trim(),
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources", resourceId] });
      router.push(`/resources/${resourceId}`);
    },
  });

  return (
    <section className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-[22px] font-semibold text-[var(--ink)]">Edit Metadata</h1>
      <Card className="p-6 space-y-4">
        <label className="block space-y-1.5 text-[12px]">
          <span className="font-medium text-[var(--ink)]">Title *</span>
          <input className={inputCls} {...register("title")} placeholder="Resource title" />
          {errors.title && <p className="text-[11px] text-[#d24545]">{errors.title.message}</p>}
        </label>
        <label className="block space-y-1.5 text-[12px]">
          <span className="font-medium text-[var(--ink)]">Description</span>
          <textarea className={`${inputCls} min-h-[80px]`} {...register("description")} placeholder="Optional description" />
        </label>
        <label className="block space-y-1.5 text-[12px]">
          <span className="font-medium text-[var(--ink)]">Tags (comma separated)</span>
          <input className={inputCls} {...register("tags")} placeholder="e.g. exam, semester" />
        </label>
        {mutation.isError && (
          <p className="text-[12px] text-[#d24545]">{getErrorMessage(mutation.error, "Update failed.")}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="button" onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Card>
    </section>
  );
}

// ─── Upload Wizard ───────────────────────────────────────────────────────────

const uploadSchema = z.object({
  resourceType: z.enum(["CLASS_NOTES", "LECTURE_NOTES", "SYLLABUS", "VIDEO", "PYQ", "BOOK_PDF"]),
  youtubeUrl: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  departmentId: z.string().min(1, "Department is required"),
  sessionId: z.string().optional(),
  collegeId: z.string().optional(),
  visibility: z.enum(["COLLEGE", "PLATFORM"]),
  tags: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "CLASS_NOTES", label: "Class Notes" },
  { value: "LECTURE_NOTES", label: "Lecture Notes" },
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "VIDEO", label: "Video" },
  { value: "PYQ", label: "Previous Year Questions (PYQ)" },
  { value: "BOOK_PDF", label: "Book PDF" },
];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-50";

function UploadWizard({ user, versionOfId }: { user: User; versionOfId: string | null }) {
  const router = useRouter();
  const mutation = useUploadResourceMutation();

  const isVersioning = Boolean(versionOfId);
  // Versioning: skip to file step directly, then review
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(isVersioning ? 2 : 1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      resourceType: "CLASS_NOTES",
      title: "",
      description: "",
      courseId: "",
      departmentId: user.departmentId ?? "",
      sessionId: user.sessionId ?? "",
      collegeId: user.collegeId ?? "",
      visibility: "COLLEGE",
      tags: "",
      youtubeUrl: "",
    },
  });

  const resourceType = watch("resourceType");
  const courseId = watch("courseId");
  const departmentId = watch("departmentId");
  const sessionId = watch("sessionId");
  const title = watch("title");
  const youtubeUrl = watch("youtubeUrl");

  const { data: allDepartments } = useDepartmentsQuery();
  const { data: courses } = useCoursesQuery(departmentId || undefined);
  const { data: sessions } = useSessionsQuery(departmentId || undefined);

  const isPYQMissingSession = resourceType === "PYQ" && !sessionId?.trim();
  const canProceedFromStep3 = courseId?.trim() && departmentId?.trim() && !isPYQMissingSession;
  const canProceedFromStep2 = selectedFile !== null || (youtubeUrl && youtubeUrl.trim().length > 0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setSelectedFile(acceptedFiles[0]);
    },
  });

  const onSubmit = async (data: UploadFormData) => {
    setDuplicateWarning(null);
    setSubmitError(null);
    try {
      const res = await mutation.mutateAsync({
        file: selectedFile,
        youtubeUrl: data.youtubeUrl?.trim() || undefined,
        resourceType: data.resourceType,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        courseId: data.courseId.trim(),
        departmentId: data.departmentId.trim(),
        sessionId: data.sessionId?.trim() || undefined,
        visibility: data.visibility,
        collegeId: data.collegeId?.trim() || undefined,
        versionOfId: versionOfId ?? null,
      });

      if ((res as unknown as { duplicateHashWarning?: boolean })?.duplicateHashWarning) {
        setDuplicateWarning("A file with identical content already exists for this course.");
      } else {
        router.push("/my-uploads");
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Upload failed. Please try again.");
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("hash")) {
        setDuplicateWarning("Duplicate file hash detected. You may still proceed.");
      } else {
        setSubmitError(msg);
      }
    }
  };

  // Total visible steps: versioning = 2 (file + review), otherwise 5
  const totalSteps = isVersioning ? 2 : 5;
  const currentStepLabel = isVersioning
    ? step === 2 ? "File" : "Review"
    : ["Type", "File", "Classification", "Visibility", "Review"][step - 1];

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">
          {isVersioning ? "New Version Wizard" : "Upload Wizard"}
        </p>
        <h1 className="mt-2 text-[26px] font-semibold text-[var(--ink)]">
          {isVersioning ? "Add New Version" : "Share a Resource"}
        </h1>

        {isVersioning && (
          <div className="mt-3 rounded-[8px] border border-[#c9973b]/40 bg-[#f6ecd8] px-4 py-2.5 text-[12px] text-[#c9973b]">
            Adding a new version to resource: <span className="font-semibold">{versionOfId}</span>. Only the file upload step is required.
          </div>
        )}

        {/* Step progress */}
        <div className="mt-4 flex items-center gap-1.5 rounded-[8px] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-2.5">
          {(isVersioning ? [2, 5] : [1, 2, 3, 4, 5]).map((s, idx) => (
            <div key={s} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-[var(--line)] text-[10px]">›</span>}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                  step === s
                    ? "bg-[var(--ink)] text-white"
                    : step > s
                    ? "bg-[var(--ph-strong)] text-[var(--ink-soft)]"
                    : "bg-[var(--ph)] text-[var(--ink-soft)]"
                }`}
              >
                {idx + 1}
              </span>
              <span className={`hidden text-[11px] font-medium sm:inline ${step === s ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}>
                {currentStepLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {duplicateWarning && (
        <div className="mb-4 rounded-[8px] border border-[#c9973b]/40 bg-[#f6ecd8] px-4 py-2.5 text-[12px] text-[#c9973b]">
          {duplicateWarning}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          {/* STEP 1: Resource Type (skipped when versioning) */}
          {step === 1 && !isVersioning && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">Choose Resource Type</h2>
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                {RESOURCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue("resourceType", t.value)}
                    className={`rounded-[8px] border p-3 text-left text-[12px] transition ${
                      resourceType === t.value
                        ? "border-[var(--ink)] bg-[var(--ph)] text-[var(--ink)]"
                        : "border-[var(--line-soft)] text-[var(--ink-soft)] hover:bg-[var(--ph)]"
                    }`}
                  >
                    <p className="font-semibold">{t.label}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setStep(2)}>Next: File →</Button>
              </div>
            </div>
          )}

          {/* STEP 2: File / YouTube */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">Upload File or YouTube Link</h2>

              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-[8px] border-2 border-dashed p-8 text-center transition ${
                  isDragActive
                    ? "border-[var(--accent)] bg-[var(--ph)]"
                    : "border-[var(--line)] hover:border-[var(--ink-soft)]"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-[22px]">📁</p>
                <p className="mt-2 text-[12px] font-semibold text-[var(--ink)]">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop, or click to browse"}
                </p>
                <p className="mt-1 text-[11px] text-[var(--ink-soft)]">PDF, DOCX, ZIP, MP4 up to 50MB</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--line-soft)]" />
                <span className="text-[11px] uppercase text-[var(--ink-soft)]">or</span>
                <div className="h-px flex-1 bg-[var(--line-soft)]" />
              </div>

              <label className="block space-y-1.5 text-[12px]">
                <span className="font-medium text-[var(--ink)]">YouTube Video Link</span>
                <input className={inputCls} {...register("youtubeUrl")} placeholder="https://www.youtube.com/watch?v=..." />
              </label>

              <div className="flex justify-between pt-2">
                {!isVersioning && <Button type="button" variant="ghost" onClick={() => setStep(1)}>← Back</Button>}
                {isVersioning && <span />}
                <Button
                  type="button"
                  disabled={!canProceedFromStep2}
                  onClick={() => isVersioning ? setStep(5) : setStep(3)}
                >
                  {isVersioning ? "Review →" : "Next: Classification →"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Classification (skipped when versioning) */}
          {step === 3 && !isVersioning && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">Classification & Details</h2>

              <label className="block space-y-1.5 text-[12px]">
                <span className="font-medium text-[var(--ink)]">Title *</span>
                <input className={inputCls} {...register("title")} placeholder="e.g. CSE301 Midterm Past Questions 2024" />
                {errors.title && <p className="text-[11px] text-[#d24545]">{errors.title.message}</p>}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5 text-[12px]">
                  <span className="font-medium text-[var(--ink)]">Department *</span>
                  <select
                    className={inputCls}
                    {...register("departmentId")}
                    onChange={(e) => {
                      setValue("departmentId", e.target.value);
                      setValue("courseId", "");
                      setValue("sessionId", "");
                    }}
                  >
                    <option value="">Select department…</option>
                    {(allDepartments ?? []).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 text-[12px]">
                  <span className="font-medium text-[var(--ink)]">Course *</span>
                  <select className={inputCls} {...register("courseId")} disabled={!departmentId || !courses}>
                    <option value="">{!departmentId ? "Select department first" : "Select course…"}</option>
                    {(courses ?? []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5 text-[12px]">
                <span className="font-medium text-[var(--ink)]">Session {resourceType === "PYQ" ? "*" : "(Optional)"}</span>
                <select
                  className={`${inputCls} ${isPYQMissingSession ? "border-[#d24545]" : ""}`}
                  {...register("sessionId")}
                  disabled={!departmentId || !sessions}
                >
                  <option value="">{!departmentId ? "Select department first" : "Select session…"}</option>
                  {(sessions ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
                {isPYQMissingSession && (
                  <p className="text-[11px] text-[#d24545]">PYQ resources require a session.</p>
                )}
              </label>

              <label className="block space-y-1.5 text-[12px]">
                <span className="font-medium text-[var(--ink)]">Description (Optional)</span>
                <textarea className={`${inputCls} min-h-[72px]`} {...register("description")} placeholder="Additional context…" />
              </label>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                <Button type="button" disabled={!canProceedFromStep3 || !title?.trim()} onClick={() => setStep(4)}>
                  Next: Visibility →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Visibility (skipped when versioning) */}
          {step === 4 && !isVersioning && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">Visibility Settings</h2>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-3 rounded-[8px] border border-[var(--line-soft)] p-3 cursor-pointer hover:bg-[var(--ph)]">
                  <input type="radio" value="COLLEGE" {...register("visibility")} className="mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--ink)]">College Only (Default)</p>
                    <p className="text-[11px] text-[var(--ink-soft)]">Accessible to verified members within your college.</p>
                  </div>
                </label>

                {(user.role === "TEACHER" || user.role === "SUB_ADMIN" || user.role === "PLATFORM_ADMIN") && (
                  <label className="flex items-start gap-3 rounded-[8px] border border-[var(--line-soft)] p-3 cursor-pointer hover:bg-[var(--ph)]">
                    <input type="radio" value="PLATFORM" {...register("visibility")} className="mt-0.5" />
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--ink)]">Platform-wide</p>
                      <p className="text-[11px] text-[var(--ink-soft)]">Available across all colleges on NoteKoi.</p>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => setStep(3)}>← Back</Button>
                <Button type="button" onClick={() => setStep(5)}>Next: Review →</Button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-[var(--ink)]">Review & Submit</h2>

              <div className="rounded-[8px] border border-[var(--line-soft)] divide-y divide-[var(--line-soft)]">
                {!isVersioning && (
                  <>
                    <div className="flex justify-between px-4 py-2.5 text-[12px]">
                      <span className="text-[var(--ink-soft)]">Title</span>
                      <span className="font-semibold text-[var(--ink)]">{watch("title") || "—"}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5 text-[12px]">
                      <span className="text-[var(--ink-soft)]">Type</span>
                      <span className="font-semibold text-[var(--ink)]">{watch("resourceType")}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5 text-[12px]">
                      <span className="text-[var(--ink-soft)]">Visibility</span>
                      <span className="font-semibold text-[var(--ink)]">{watch("visibility")}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between px-4 py-2.5 text-[12px]">
                  <span className="text-[var(--ink-soft)]">File / Link</span>
                  <span className="font-semibold text-[var(--ink)]">{selectedFile ? selectedFile.name : watch("youtubeUrl") || "—"}</span>
                </div>
              </div>

              {submitError && (
                <p className="rounded-[8px] bg-[#fbe6e6] px-4 py-2.5 text-[12px] text-[#d24545]">{submitError}</p>
              )}

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" onClick={() => isVersioning ? setStep(2) : setStep(4)}>← Back</Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Submitting…" : isVersioning ? "Submit New Version" : "Submit Resource"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </form>
    </section>
  );
}
