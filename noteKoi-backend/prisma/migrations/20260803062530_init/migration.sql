-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLATFORM_ADMIN', 'SUB_ADMIN', 'STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "TeacherVerificationStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED');

-- CreateEnum
CREATE TYPE "CrCoCrType" AS ENUM ('CR', 'CO_CR');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('CLASS_NOTES', 'LECTURE_NOTES', 'SYLLABUS', 'VIDEO', 'PYQ', 'BOOK_PDF');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('COLLEGE', 'PLATFORM');

-- CreateEnum
CREATE TYPE "ResourceState" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'SUPERSEDED', 'DELETION_REQUESTED', 'DELETED');

-- CreateEnum
CREATE TYPE "PromotionPath" AS ENUM ('PATH_A', 'PATH_B');

-- CreateEnum
CREATE TYPE "PromotionRecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "PromotionEventAction" AS ENUM ('PROMOTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INCORRECT', 'SPAM', 'PLAGIARISED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESOURCE_APPROVED', 'RESOURCE_REJECTED', 'PROMOTION_RECOMMENDATION_APPROVED', 'PROMOTION_RECOMMENDATION_DENIED', 'DELETION_APPROVED', 'DELETION_DENIED', 'PROMOTED_RESOURCE_LATER_REJECTED');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('RESOURCE_CRUD', 'PROMOTION_DECISION', 'ROLE_APPOINTMENT');

-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_departments" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "adoptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "college_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collegeId" TEXT,
    "regNo" TEXT,
    "departmentId" TEXT,
    "sessionId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "teacherVerificationStatus" "TeacherVerificationStatus",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_departments" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_admin_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "appointedById" TEXT NOT NULL,
    "appointedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sub_admin_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cr_co_cr_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "CrCoCrType" NOT NULL,
    "appointedById" TEXT NOT NULL,
    "isEmergencyAppointment" BOOLEAN NOT NULL DEFAULT false,
    "appointedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cr_co_cr_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "rootResourceId" TEXT,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "uploaderId" TEXT NOT NULL,
    "uploaderRoleSnapshot" "Role" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "courseId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "sessionId" TEXT,
    "visibility" "Visibility" NOT NULL,
    "collegeId" TEXT,
    "contentHash" TEXT,
    "fileUrl" TEXT,
    "youtubeUrl" TEXT,
    "state" "ResourceState" NOT NULL DEFAULT 'PENDING',
    "deletionFlag" BOOLEAN NOT NULL DEFAULT false,
    "deletionRequestedAt" TIMESTAMP(3),
    "moderatorId" TEXT,
    "moderatorDecisionAt" TIMESTAMP(3),
    "moderatorReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_recommendations" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "recommendedById" TEXT NOT NULL,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PromotionRecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "invalidatedAt" TIMESTAMP(3),
    "invalidationReason" TEXT,

    CONSTRAINT "promotion_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_events" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "path" "PromotionPath" NOT NULL,
    "action" "PromotionEventAction" NOT NULL,
    "actorId" TEXT NOT NULL,
    "isExceptionalOverride" BOOLEAN NOT NULL DEFAULT false,
    "recommendationId" TEXT,
    "justificationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "note" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deletion_requests" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionReason" TEXT,

    CONSTRAINT "deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "reason" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_override_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "overrideType" "OverrideType" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "justificationNote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_override_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_name_key" ON "colleges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "college_departments_collegeId_departmentId_key" ON "college_departments"("collegeId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_departmentId_label_key" ON "sessions"("departmentId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_collegeId_regNo_key" ON "users"("collegeId", "regNo");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_departments_teacherId_departmentId_key" ON "teacher_departments"("teacherId", "departmentId");

-- CreateIndex
CREATE INDEX "sub_admin_assignments_collegeId_isActive_idx" ON "sub_admin_assignments"("collegeId", "isActive");

-- CreateIndex
CREATE INDEX "cr_co_cr_assignments_departmentId_sessionId_isActive_idx" ON "cr_co_cr_assignments"("departmentId", "sessionId", "isActive");

-- CreateIndex
CREATE INDEX "resources_collegeId_courseId_contentHash_idx" ON "resources"("collegeId", "courseId", "contentHash");

-- CreateIndex
CREATE INDEX "resources_rootResourceId_idx" ON "resources"("rootResourceId");

-- CreateIndex
CREATE INDEX "resources_state_idx" ON "resources"("state");

-- CreateIndex
CREATE INDEX "promotion_recommendations_resourceId_status_idx" ON "promotion_recommendations"("resourceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_events_recommendationId_key" ON "promotion_events"("recommendationId");

-- CreateIndex
CREATE INDEX "promotion_events_resourceId_idx" ON "promotion_events"("resourceId");

-- CreateIndex
CREATE INDEX "reports_resourceId_status_idx" ON "reports"("resourceId", "status");

-- CreateIndex
CREATE INDEX "deletion_requests_resourceId_status_idx" ON "deletion_requests"("resourceId", "status");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "admin_override_logs_overrideType_createdAt_idx" ON "admin_override_logs"("overrideType", "createdAt");

-- AddForeignKey
ALTER TABLE "college_departments" ADD CONSTRAINT "college_departments_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "college_departments" ADD CONSTRAINT "college_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_departments" ADD CONSTRAINT "teacher_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_admin_assignments" ADD CONSTRAINT "sub_admin_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_admin_assignments" ADD CONSTRAINT "sub_admin_assignments_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_admin_assignments" ADD CONSTRAINT "sub_admin_assignments_appointedById_fkey" FOREIGN KEY ("appointedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_admin_assignments" ADD CONSTRAINT "sub_admin_assignments_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_appointedById_fkey" FOREIGN KEY ("appointedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cr_co_cr_assignments" ADD CONSTRAINT "cr_co_cr_assignments_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_rootResourceId_fkey" FOREIGN KEY ("rootResourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_recommendedById_fkey" FOREIGN KEY ("recommendedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_recommendations" ADD CONSTRAINT "promotion_recommendations_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_events" ADD CONSTRAINT "promotion_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_events" ADD CONSTRAINT "promotion_events_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "promotion_recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_events" ADD CONSTRAINT "promotion_events_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_override_logs" ADD CONSTRAINT "admin_override_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
