import { Role, VerificationStatus } from "@prisma/client";

// Augment Express Request with the authenticated user payload.
// This is the canonical shape attached by the `authenticate` middleware.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sub: string;
        type: "access";
        role: Role;
        verificationStatus: VerificationStatus;
        collegeId: string;
        classroomUnitId: string | null;
      };
    }
  }
}

export {};
