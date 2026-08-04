"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addResourceVersion, createResource, uploadResourceFile } from "@/lib/api/resources";
import type { ResourceType, Visibility } from "@/lib/types";

export interface UploadResourceInput {
  file?: File | null;
  youtubeUrl?: string;
  resourceType: ResourceType;
  title: string;
  description?: string | null;
  tags?: string[];
  courseId: string;
  departmentId: string;
  sessionId?: string;
  visibility: Visibility;
  collegeId?: string;
  versionOfId?: string | null;
}

export function useUploadResourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadResourceInput) => {
      // Add new version flow
      if (input.versionOfId && input.file) {
        return addResourceVersion(input.versionOfId, input.file);
      }

      // Standard create flow
      const payload = {
        resourceType: input.resourceType,
        title: input.title,
        description: input.description ?? null,
        tags: input.tags,
        courseId: input.courseId,
        departmentId: input.departmentId,
        sessionId: input.sessionId,
        visibility: input.visibility,
        collegeId: input.collegeId,
        fileUrl: undefined as string | undefined,
        youtubeUrl: input.youtubeUrl,
        contentHash: undefined as string | undefined,
      };

      if (input.file) {
        const uploadResponse = await uploadResourceFile(input.file);
        payload.fileUrl = uploadResponse.fileUrl;
        payload.contentHash = uploadResponse.contentHash;
      }

      return createResource(payload as Parameters<typeof createResource>[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources", "my-uploads"] });
    },
  });
}
