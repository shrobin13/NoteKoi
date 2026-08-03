import { z } from "zod";
import { resourceIdParamSchema } from "./resource.validator.js";

export const openReviewParams = resourceIdParamSchema;

export const approveBody = z.object({
  reason: z.string().trim().max(1000).optional().nullable(),
});

export const rejectBody = z.object({
  reason: z.string().trim().min(1).max(1000),
});

export const reportBody = z.object({
  reason: z.enum(["INCORRECT", "SPAM", "PLAGIARISED"]),
  note: z.string().trim().max(1000).optional().nullable(),
});

export const deletionDecisionBody = z.object({
  approve: z.boolean(),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export const deletionRequestParams = resourceIdParamSchema;

export const reportParams = resourceIdParamSchema;

export const resubmitParams = resourceIdParamSchema;
