"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadResourceMutation } from "@/hooks/useUploadResourceMutation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDepartmentsQuery } from "@/hooks/useDepartmentsQuery";
import { useCoursesQuery } from "@/hooks/useCoursesQuery";
import { useSessionsQuery } from "@/hooks/useSessionsQuery";
import { ResourceType, UploaderRoleSnapshot, User, Visibility } from "@/lib/types";

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading upload wizard…</div>}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadPageContent() {
  const { user, isLoading, error } = useRequireAuth();
  const searchParams = useSearchParams();
  const versionOfId = searchParams.get("versionOf");

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload Wizard</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Share a new resource</h1>
        </div>
        <Card className="h-80 animate-pulse border-slate-800/80 bg-slate-900/80 p-6" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Card className="border-slate-700/80 bg-slate-900/80 p-8 text-center">
          <p className="text-slate-300">Please sign in to upload resources.</p>
        </Card>
      </section>
    );
  }

  return <UploadWizard user={user} versionOfId={versionOfId} />;
}

const uploadSchema = z.object({
  resourceType: z.enum(["CLASS_NOTES", "LECTURE_NOTES", "SYLLABUS", "VIDEO", "PYQ", "BOOK_PDF"]),
  youtubeUrl: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
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

function UploadWizard({ user, versionOfId }: { user: User; versionOfId: string | null }) {
  const router = useRouter();
  const mutation = useUploadResourceMutation();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UploadFormData>({
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

  // Step 3 Validation: PYQ missing session/year blocks Next button (Milestone 4 task 1 Step 3)
  const isPYQMissingSession = resourceType === "PYQ" && !sessionId?.trim();
  const canProceedFromStep3 = courseId?.trim() && departmentId?.trim() && !isPYQMissingSession;

  // Step 2 Validation: Must have file or YouTube link
  const canProceedFromStep2 = selectedFile !== null || (youtubeUrl && youtubeUrl.trim().length > 0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setSelectedFile(acceptedFiles[0]);
    },
  });

  const uploaderRoleSnapshot: UploaderRoleSnapshot =
    user.role === "TEACHER" || user.role === "SUB_ADMIN" || user.role === "PLATFORM_ADMIN"
      ? user.role
      : "STUDENT";

  const onSubmit = async (data: UploadFormData) => {
    setDuplicateWarning(null);
    try {
      const res = await mutation.mutateAsync({
        file: selectedFile,
        youtubeUrl: data.youtubeUrl?.trim() || undefined,
        uploaderId: user.id,
        uploaderRoleSnapshot,
        resourceType: data.resourceType,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        courseId: data.courseId.trim(),
        departmentId: data.departmentId.trim(),
        sessionId: data.sessionId?.trim() || undefined,
        visibility: data.visibility,
        collegeId: data.collegeId?.trim() || undefined,
      });

      // If backend returns a duplicate hash response, surface non-blocking warning banner
      if ((res as unknown as { duplicateHashWarning?: boolean })?.duplicateHashWarning) {
        setDuplicateWarning("Warning: A file with identical content already exists for this course.");
      } else {
        router.push("/my-uploads");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("duplicate") || msg.includes("hash")) {
        setDuplicateWarning("Warning: Backend reported duplicate file hash. You may review or proceed.");
      }
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
          {versionOfId ? "New Version Wizard" : "Upload Wizard"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {versionOfId ? "Creating New Version" : "Share a Resource"}
        </h1>

        {/* Step Progress Bar */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 border border-slate-800 text-xs">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-semibold ${
                  step === s
                    ? "bg-indigo-600 text-white"
                    : step > s
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {s}
              </span>
              <span className={`hidden sm:inline font-medium ${step === s ? "text-white" : "text-slate-500"}`}>
                {s === 1 && "Type"}
                {s === 2 && "File"}
                {s === 3 && "Classification"}
                {s === 4 && "Visibility"}
                {s === 5 && "Review"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {duplicateWarning && (
        <div className="mb-6 rounded-2xl border border-amber-700/60 bg-amber-900/20 p-4 text-sm text-amber-200">
          <p className="font-semibold">{duplicateWarning}</p>
          <p className="mt-1 text-xs text-amber-300/80">This is a non-blocking warning. You can still proceed or edit your file.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          {/* STEP 1: Select Resource Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Step 1: Choose Resource Type</h2>
              <p className="text-sm text-slate-400">Select the category that best describes your document or media.</p>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {RESOURCE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue("resourceType", t.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      resourceType === t.value
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <p className="font-semibold">{t.label}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setStep(2)}>Next: File / Link →</Button>
              </div>
            </div>
          )}

          {/* STEP 2: File Upload (react-dropzone) / YouTube Link */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Step 2: Upload File or Provide YouTube Link</h2>
              <p className="text-sm text-slate-400">Drag and drop your file or enter a YouTube video URL.</p>

              {/* Desktop Drag and Drop Zone */}
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-950/30"
                    : "border-slate-700 bg-slate-950/60 hover:border-slate-600"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-2xl">📁</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop a file here, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-slate-500">PDF, DOCX, ZIP, MP4 up to 50MB</p>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-xs uppercase text-slate-500">OR</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-200">YouTube Video Link</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  {...register("youtubeUrl")}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </label>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>← Back</Button>
                <Button type="button" disabled={!canProceedFromStep2} onClick={() => setStep(3)}>Next: Classification →</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Classification */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Step 3: Classification & Details</h2>
              <p className="text-sm text-slate-400">Provide course and department information to index your resource.</p>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-200">Title *</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  {...register("title")}
                  placeholder="e.g. CSE301 Midterm Past Question 2024"
                />
                {errors.title && <p className="text-xs text-rose-400">{errors.title.message}</p>}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-slate-200">Department *</span>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                    {...register("departmentId")}
                    onChange={(e) => {
                      setValue("departmentId", e.target.value);
                      setValue("courseId", "");
                      setValue("sessionId", "");
                    }}
                  >
                    <option value="">Select department…</option>
                    {(allDepartments ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2 text-sm">
                  <span className="font-medium text-slate-200">Course *</span>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-50"
                    {...register("courseId")}
                    disabled={!departmentId || !courses}
                  >
                    <option value="">
                      {!departmentId ? "Select department first" : "Select course…"}
                    </option>
                    {(courses ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-200">
                  Session {resourceType === "PYQ" ? "*" : "(Optional)"}
                </span>
                <select
                  className={`w-full rounded-2xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500 disabled:opacity-50 ${
                    isPYQMissingSession ? "border-rose-500" : "border-slate-700"
                  }`}
                  {...register("sessionId")}
                  disabled={!departmentId || !sessions}
                >
                  <option value="">
                    {!departmentId ? "Select department first" : "Select session…"}
                  </option>
                  {(sessions ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {isPYQMissingSession && (
                  <p className="text-xs font-semibold text-rose-400">
                    Validation error: PYQ resources require a Session/Year. Next button is blocked.
                  </p>
                )}
              </label>

              <label className="block space-y-2 text-sm">
                <span className="font-medium text-slate-200">Description (Optional)</span>
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
                  {...register("description")}
                  placeholder="Additional context about this resource…"
                />
              </label>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>← Back</Button>
                <Button type="button" disabled={!canProceedFromStep3 || !title?.trim()} onClick={() => setStep(4)}>Next: Visibility →</Button>
              </div>
            </div>
          )}

          {/* STEP 4: Visibility */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Step 4: Visibility Settings</h2>
              <p className="text-sm text-slate-400">Choose who can access this resource.</p>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 cursor-pointer">
                  <input
                    type="radio"
                    value="COLLEGE"
                    {...register("visibility")}
                    className="mt-1 accent-indigo-500"
                  />
                  <div>
                    <p className="font-semibold text-white">College Only (Default)</p>
                    <p className="text-xs text-slate-400">Accessible to verified students and faculty within your college.</p>
                  </div>
                </label>

                {user.role === "TEACHER" || user.role === "SUB_ADMIN" || user.role === "PLATFORM_ADMIN" ? (
                  <label className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 cursor-pointer">
                    <input
                      type="radio"
                      value="PLATFORM"
                      {...register("visibility")}
                      className="mt-1 accent-indigo-500"
                    />
                    <div>
                      <p className="font-semibold text-white">Platform-wide</p>
                      <p className="text-xs text-slate-400">Available across all colleges on NoteKoi (Teacher / Admin privilege).</p>
                    </div>
                  </label>
                ) : (
                  <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 text-xs text-slate-400">
                    Student uploads default to College visibility. CRs and Sub Admins may recommend or promote resources platform-wide later.
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(3)}>← Back</Button>
                <Button type="button" onClick={() => setStep(5)}>Next: Review & Submit →</Button>
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Step 5: Review & Submit</h2>
              <p className="text-sm text-slate-400">Review your submission details before publishing.</p>

              <div className="rounded-2xl bg-slate-950 p-5 space-y-3 text-sm text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Title</span><span className="font-semibold text-white">{watch("title")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="font-semibold text-white">{watch("resourceType")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Course / Dept</span><span className="font-semibold text-white">{watch("courseId")} / {watch("departmentId")}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Session</span><span className="font-semibold text-white">{watch("sessionId") || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">File / Link</span><span className="font-semibold text-white">{selectedFile ? selectedFile.name : watch("youtubeUrl") || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Visibility</span><span className="font-semibold text-white">{watch("visibility")}</span></div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(4)}>← Back</Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Submitting…" : "Submit Resource"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </form>
    </section>
  );
}
