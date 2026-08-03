"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadResourceMutation } from "@/hooks/useUploadResourceMutation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ResourceType, UploaderRoleSnapshot, User, Visibility } from "@/lib/types";

const resourceTypeOptions: { value: ResourceType; label: string }[] = [
  { value: "CLASS_NOTES", label: "Class notes" },
  { value: "LECTURE_NOTES", label: "Lecture notes" },
  { value: "SYLLABUS", label: "Syllabus" },
  { value: "VIDEO", label: "Video" },
  { value: "PYQ", label: "Previous year questions" },
  { value: "BOOK_PDF", label: "Book PDF" },
];

const visibilityOptions: { value: Visibility; label: string }[] = [
  { value: "COLLEGE", label: "College" },
  { value: "PLATFORM", label: "Platform" },
];

export default function UploadPage() {
  const { user, isLoading, error } = useRequireAuth();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Share a new resource</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Loading your account data...</p>
        </div>
        <Card className="h-80 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Upload</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Unable to load your account. Please try again or sign in if you are not logged in.
          </p>
        </div>
      </section>
    );
  }

  return <UploadForm user={user} />;
}

function UploadForm({ user }: { user: User }) {
  const router = useRouter();
  const mutation = useUploadResourceMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("CLASS_NOTES");
  const [visibility, setVisibility] = useState<Visibility>(user.role === "STUDENT" ? "COLLEGE" : "COLLEGE");
  const [courseId, setCourseId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sessionId, setSessionId] = useState(user.sessionId ?? "");
  const [collegeId, setCollegeId] = useState(user.collegeId ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tags, setTags] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (mutation.isSuccess) {
      router.push("/my-uploads");
    }
  }, [mutation.isSuccess, router]);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      courseId.trim().length > 0 &&
      departmentId.trim().length > 0 &&
      (file !== null || youtubeUrl.trim().length > 0) &&
      !mutation.isPending
    );
  }, [title, courseId, departmentId, file, youtubeUrl, mutation.isPending]);

  const allowedUploaderRoleSnapshot = useMemo<UploaderRoleSnapshot>(() => {
    if (user.role === "TEACHER" || user.role === "SUB_ADMIN" || user.role === "PLATFORM_ADMIN") {
      return user.role;
    }
    return "STUDENT";
  }, [user.role]);

  const isValidYouTubeUrl = (value: string) => {
    if (!value) return true;
    return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/i.test(value.trim());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !courseId.trim() || !departmentId.trim()) {
      setFormError("Please fill in the required fields before uploading.");
      return;
    }

    if (!file && !youtubeUrl.trim()) {
      setFormError("Please select a file or provide a YouTube link.");
      return;
    }

    if (youtubeUrl.trim() && !isValidYouTubeUrl(youtubeUrl.trim())) {
      setFormError("Please enter a valid YouTube URL or remove it.");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    mutation.mutate({
      file,
      youtubeUrl: youtubeUrl.trim() || undefined,
      uploaderId: user.id,
      uploaderRoleSnapshot: allowedUploaderRoleSnapshot,
      resourceType,
      title: title.trim(),
      description: description.trim() || null,
      tags: tagArray.length > 0 ? tagArray : undefined,
      courseId: courseId.trim(),
      departmentId: departmentId.trim(),
      sessionId: sessionId.trim() || undefined,
      visibility,
      collegeId: collegeId.trim() || undefined,
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upload</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Share a new resource</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Upload a resource file or add a YouTube link, then provide metadata so other students can discover it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Title</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter resource title"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Type</span>
                <select
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={resourceType}
                  onChange={(event) => setResourceType(event.target.value as ResourceType)}
                >
                  {resourceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-200">Description</span>
              <textarea
                className="min-h-30 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short description of the resource"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Course ID</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  placeholder="e.g. CS101"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Department ID</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                  placeholder="e.g. CSE"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">College ID</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={collegeId}
                  onChange={(event) => setCollegeId(event.target.value)}
                  placeholder="e.g. college_123"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Session ID</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={sessionId}
                  onChange={(event) => setSessionId(event.target.value)}
                  placeholder="e.g. 2025"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {user.role === "STUDENT" ? (
                <div className="space-y-2 text-sm">
                  <span className="font-medium text-slate-200">Visibility</span>
                  <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100">
                    College (Student uploads are always College visibility)
                  </div>
                </div>
              ) : (
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-200">Visibility</span>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    value={visibility}
                    onChange={(event) => setVisibility(event.target.value as Visibility)}
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">Tags</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="e.g. pyq, semester5, notes"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">File</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  type="file"
                  accept="*/*"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                {file ? <p className="text-sm text-slate-400">Selected: {file.name}</p> : null}
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-200">YouTube link</span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="Optional YouTube URL"
                />
              </label>
            </div>

            {formError ? (
              <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>
            ) : null}

            {mutation.error ? (
              <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {getErrorMessage(mutation.error, "Upload failed. Please try again.")}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate-400">
                <p className="font-semibold text-white">Upload requirements</p>
                <p>Required fields: title, course, department, and file or YouTube link.</p>
              </div>
              <Button type="submit" disabled={!canSubmit}>
                {mutation.isPending ? "Uploading…" : "Upload resource"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-700/80 bg-slate-900/80 p-6">
            <p className="text-sm font-semibold text-white">Upload guide</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Choose a single file and provide metadata to make your resource searchable.</p>
              <p>Use a descriptive title and a clear description so other learners can find it.</p>
              <p>If you’re uploading class notes or PDFs, keep visibility set to College unless you want it shared platform-wide.</p>
            </div>
          </Card>

          <Card className="border-slate-700/80 bg-slate-900/80 p-6">
            <p className="text-sm font-semibold text-white">Account info</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>{`Uploading as ${user.name ?? user.email} (${user.role}).`}</p>
              <p>File uploads require an authenticated session and may be rejected if your account is not verified.</p>
            </div>
          </Card>
        </div>
      </form>
    </section>
  );
}
