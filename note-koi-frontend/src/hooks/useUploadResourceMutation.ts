"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResource, uploadResourceFile } from "@/lib/api/resources";
import type { ResourceType, UploaderRoleSnapshot, Visibility } from "@/lib/types";

export interface UploadResourceInput {
  file?: File | null;
  youtubeUrl?: string;
  uploaderId: string;
  uploaderRoleSnapshot: UploaderRoleSnapshot;
  resourceType: ResourceType;
  title: string;
  description?: string | null;
  tags?: string[];
  courseId: string;
  departmentId: string;
  sessionId?: string;
  visibility: Visibility;
  collegeId?: string;
}

export function useUploadResourceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UploadResourceInput) => {
      const payload = {
        uploaderId: input.uploaderId,
        uploaderRoleSnapshot: input.uploaderRoleSnapshot,
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

      return createResource(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources", "my-uploads"] });
    },
  });
}
