# API Documentation

Base URL: `/api/v1`

Authentication is handled via the `authenticate` middleware and, where applicable, `authorize` for role-based access. Most authenticated routes expect cookies/session-based auth.

## Conventions

- All paths below are relative to the base URL unless noted otherwise.
- Auth routes are mounted under `/api/v1/auth`.
- User routes are mounted under `/api/v1/users`.
- Other routes are mounted directly under `/api/v1`.
- Role names: `PLATFORM_ADMIN`, `SUB_ADMIN`, `STUDENT`, `TEACHER`.

---

## 1. Health

### `GET /health`
- Description: Health check endpoint.
- Auth: None.
- Response: `{ status: "ok" }`

---

## 2. Authentication

### `POST /auth/login`
- Description: Log in a user.
- Auth: None.
- Body:
  - `email: string` (valid email)
  - `password: string` (min 8 chars)

### `POST /auth/register/student`
- Description: Register a student.
- Auth: None.
- Body:
  - `email: string`
  - `password: string`
  - `collegeId: string`
  - `departmentId: string`
  - `sessionId: string`
  - `regNo: string`

### `POST /auth/register/teacher`
- Description: Register a teacher.
- Auth: None.
- Body:
  - `email: string`
  - `password: string`
  - `collegeId: string`
  - `departmentIds: string[]` (min 1)

### `POST /auth/refresh`
- Description: Refresh an authentication token/session.
- Auth: CSRF guard applied.
- Body: None (cookie-based refresh flow).

### `POST /auth/logout`
- Description: Log out current user.
- Auth: CSRF guard applied.
- Body: None.

### `POST /auth/forgot-password`
- Description: Request password reset.
- Auth: None.
- Body:
  - `email: string`

### `POST /auth/reset-password`
- Description: Reset password with a token.
- Auth: None.
- Body:
  - `token: string`
  - `newPassword: string` (min 8 chars)

---

## 3. Users

### `GET /users/me`
- Description: Get the authenticated user profile.
- Auth: Required.
- Response: Current user profile data.

---

## 4. Colleges

### `GET /colleges`
- Description: List colleges.
- Auth: None.
- Query: None.

### `POST /colleges`
- Description: Create a college.
- Auth: Required; `PLATFORM_ADMIN` only.
- Body:
  - `name: string`
  - `isActive?: boolean`

### `PATCH /colleges/:id`
- Description: Update a college.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `id: string`
- Body:
  - `name?: string`
  - `isActive?: boolean`

### `GET /colleges/:collegeId/departments`
- Description: List departments adopted by a college.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `collegeId: string`

### `POST /colleges/:collegeId/departments`
- Description: Adopt a department under a college.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `collegeId: string`
- Body:
  - `departmentId: string`

### `DELETE /colleges/:collegeId/departments/:departmentId`
- Description: Revoke a department from a college.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `collegeId: string`
  - `departmentId: string`

---

## 5. Departments

### `GET /departments`
- Description: List departments.
- Auth: None.

### `POST /departments`
- Description: Create a department.
- Auth: Required; `PLATFORM_ADMIN` only.
- Body:
  - `name: string`

### `PATCH /departments/:id`
- Description: Update a department.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `id: string`
- Body:
  - `name?: string`

---

## 6. Sessions

### `GET /departments/:departmentId/sessions`
- Description: List sessions for a department.
- Auth: None.
- Params:
  - `departmentId: string`

### `POST /departments/:departmentId/sessions`
- Description: Create a session under a department.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `departmentId: string`
- Body:
  - `departmentId: string`
  - `label: string`
  - `isOpen?: boolean`

### `PATCH /sessions/:id`
- Description: Update a session.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `id: string`
- Body:
  - `label?: string`
  - `isOpen?: boolean`

---

## 7. Courses

### `GET /departments/:departmentId/courses`
- Description: List courses for a department.
- Auth: None.
- Params:
  - `departmentId: string`

### `POST /departments/:departmentId/courses`
- Description: Create a course under a department.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `departmentId: string`
- Body:
  - `departmentId: string`
  - `name: string`
  - `description?: string | null`

### `PATCH /courses/:id`
- Description: Update a course.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `id: string`
- Body:
  - `name?: string`
  - `description?: string | null`

---

## 8. Verification

### `GET /cr/student-verifications`
- Description: List student verification requests for a CR.
- Auth: Required; `STUDENT` role and active CR scope.

### `GET /sub-admin/student-verifications`
- Description: List student verification requests for a sub-admin.
- Auth: Required; `SUB_ADMIN` role and active sub-admin scope.

### `POST /student-verifications/:userId/approve`
- Description: Approve a student verification request.
- Auth: Required; `STUDENT` or `SUB_ADMIN` and active scope.
- Params:
  - `userId: string`

### `GET /sub-admin/teacher-verifications`
- Description: List teacher verification requests for a sub-admin.
- Auth: Required; `SUB_ADMIN` role and active sub-admin scope.

### `POST /sub-admin/teacher-verifications/:userId/approve`
- Description: Approve a teacher verification request.
- Auth: Required; `SUB_ADMIN` role and active sub-admin scope.
- Params:
  - `userId: string`

---

## 9. Role Assignments

### `POST /platform-admin/sub-admins`
- Description: Appoint a sub-admin.
- Auth: Required; `PLATFORM_ADMIN` only.
- Body:
  - `userId: string`
  - `collegeId: string`

### `POST /platform-admin/sub-admins/:assignmentId/revoke`
- Description: Revoke a sub-admin assignment.
- Auth: Required; `PLATFORM_ADMIN` only.
- Params:
  - `assignmentId: string`

### `POST /sub-admin/cr-assignments`
- Description: Appoint a CR or CO-CR.
- Auth: Required; `SUB_ADMIN` only.
- Body:
  - `userId: string`
  - `collegeId: string`
  - `departmentId: string`
  - `sessionId: string`
  - `type: "CR" | "CO_CR"`

### `POST /sub-admin/cr-assignments/:assignmentId/revoke`
- Description: Revoke a CR/CO-CR assignment.
- Auth: Required; `SUB_ADMIN` only.
- Params:
  - `assignmentId: string`

---

## 10. Resources

### `GET /resources`
- Description: List resources.
- Auth: None.
- Query:
  - `page?: number`
  - `limit?: number`
  - `q?: string`
  - `resourceType?: string`
  - `sessionId?: string`
  - `visibility?: string`
  - `includeOtherColleges?: boolean`

### `POST /resources`
- Description: Create a resource.
- Auth: Required.
- Body:
  - `uploaderId: string`
  - `uploaderRoleSnapshot: "STUDENT" | "TEACHER" | "SUB_ADMIN" | "PLATFORM_ADMIN"`
  - `resourceType: "CLASS_NOTES" | "LECTURE_NOTES" | "SYLLABUS" | "VIDEO" | "PYQ" | "BOOK_PDF"`
  - `title: string`
  - `description?: string | null`
  - `tags?: string[]`
  - `courseId: string`
  - `departmentId: string`
  - `sessionId?: string`
  - `visibility: "COLLEGE" | "PLATFORM"`
  - `collegeId?: string`
  - `fileUrl?: string`
  - `youtubeUrl?: string`
  - `contentHash?: string`

### `POST /resources/upload`
- Description: Upload a resource file.
- Auth: Required.
- Body: Multipart form with a `file` field.

### `GET /resources/my-uploads`
- Description: List the authenticated user’s uploads.
- Auth: Required.
- Query:
  - `page?: number`
  - `limit?: number`

### `GET /resources/:id`
- Description: View a single resource.
- Auth: None.
- Params:
  - `id: string`
- Query:
  - `includeOtherColleges?: boolean`

### `GET /resources/:id/versions`
- Description: Get version history for a resource.
- Auth: Required.
- Params:
  - `id: string`

### `PATCH /resources/:id/metadata`
- Description: Update resource metadata.
- Auth: Required; resource owner only.
- Params:
  - `id: string`
- Body:
  - `title?: string`
  - `description?: string | null`
  - `tags?: string[]`

### `PATCH /resources/:id/reassign`
- Description: Reassign a resource to a different course/department/session.
- Auth: Required; resource owner only.
- Params:
  - `id: string`
- Body:
  - `courseId: string`
  - `departmentId: string`
  - `sessionId?: string`

### `POST /resources/:id/versions`
- Description: Create a new version of a resource.
- Auth: Required; resource owner only.
- Params:
  - `id: string`
- Body:
  - `title?: string`
  - `description?: string | null`
  - `tags?: string[]`
  - `fileUrl?: string`
  - `youtubeUrl?: string`
  - `sessionId?: string`

---

## 11. Moderation

### `POST /resources/:id/open-review`
- Description: Open a resource for review.
- Auth: Required; active CR/CO-CR or sub-admin.
- Params:
  - `id: string`

### `POST /resources/:id/approve`
- Description: Approve a resource review.
- Auth: Required; active CR/CO-CR or sub-admin.
- Params:
  - `id: string`
- Body:
  - `reason?: string | null`

### `POST /resources/:id/reject`
- Description: Reject a resource review.
- Auth: Required; active CR/CO-CR or sub-admin.
- Params:
  - `id: string`
- Body:
  - `reason: string`

### `POST /resources/:id/self-cancel`
- Description: Cancel a resource submission by its owner.
- Auth: Required; resource owner only.
- Params:
  - `id: string`

### `POST /resources/:id/flag-deletion`
- Description: Flag a resource for deletion.
- Auth: Required; resource owner only.
- Params:
  - `id: string`

### `POST /resources/:id/request-deletion`
- Description: Request deletion of a resource.
- Auth: Required; resource owner only.
- Params:
  - `id: string`

### `POST /resources/:id/deletion-decision`
- Description: Approve or reject a deletion request for a resource.
- Auth: Required; active CR/CO-CR or sub-admin.
- Params:
  - `id: string`
- Body:
  - `approve: boolean`
  - `reason?: string | null`

### `POST /resources/:id/report`
- Description: Report a resource.
- Auth: Required.
- Params:
  - `id: string`
- Body:
  - `reason: "INCORRECT" | "SPAM" | "PLAGIARISED"`
  - `note?: string | null`

### `POST /resources/:id/resubmit`
- Description: Resubmit a resource after changes.
- Auth: Required; resource owner only.
- Params:
  - `id: string`

---

## 12. Notifications

### `GET /notifications`
- Description: List notifications for the authenticated user.
- Auth: Required.

### `PATCH /notifications/:id/read`
- Description: Mark a notification as read.
- Auth: Required.
- Params:
  - `id: string`

---

## 13. Promotions

### `POST /resources/:id/recommend-promotion`
- Description: Recommend a resource for promotion.
- Auth: Required; `STUDENT` only.
- Params:
  - `id: string`

### `POST /promotion-recommendations/:id/approve`
- Description: Approve a promotion recommendation.
- Auth: Required; `SUB_ADMIN` only.
- Params:
  - `id: string`

### `POST /promotion-recommendations/:id/deny`
- Description: Deny a promotion recommendation.
- Auth: Required; `SUB_ADMIN` only.
- Params:
  - `id: string`

### `POST /resources/:id/promote`
- Description: Promote a resource.
- Auth: Required; `SUB_ADMIN` only.
- Params:
  - `id: string`

### `POST /resources/:id/revoke-promotion`
- Description: Revoke a promotion from a resource.
- Auth: Required; `SUB_ADMIN` only.
- Params:
  - `id: string`

---

## 14. Analytics

### `GET /analytics/content-gaps`
- Description: Get content gap analytics.
- Auth: Required; `SUB_ADMIN` or `PLATFORM_ADMIN`.

### `GET /analytics/dedup-savings`
- Description: Get deduplication savings analytics.
- Auth: Required; `SUB_ADMIN` or `PLATFORM_ADMIN`.

### `GET /platform-admin/analytics/promotions-by-college`
- Description: Get promotion counts grouped by college.
- Auth: Required; `PLATFORM_ADMIN` only.

### `GET /sub-admin/analytics/cr-throughput`
- Description: Get CR throughput analytics for the current sub-admin.
- Auth: Required; `SUB_ADMIN` only.

---

## 15. Admin Override

### `POST /platform-admin/promotion-override`
- Description: Override promotion-related actions.
- Auth: Required; `PLATFORM_ADMIN` only.
- Body:
  - `action: "APPROVE_RECOMMENDATION" | "DENY_RECOMMENDATION" | "PROMOTE_RESOURCE"`
  - `targetId: string`
  - `justificationNote: string`
  - `reason?: string | null`

### `GET /platform-admin/analytics/override-logs`
- Description: Retrieve recent admin override logs.
- Auth: Required; `PLATFORM_ADMIN` only.

---

## 16. Notes

- Some endpoints are intentionally open for public browsing, while moderation, promotion, role-assignment, and admin operations require stricter permissions.
- Request validation is enforced through Zod schemas in the validators layer.
- For file uploads, use multipart form data and send the file under the `file` field.

## 17. Example Payloads

### Standard success response
```json
{
  "success": true,
  "data": {
    "id": "cm123abc",
    "name": "Example"
  },
  "meta": {}
}
```

### Login
Request:
```json
{
  "email": "student@example.com",
  "password": "secret123"
}
```

### Student registration
Request:
```json
{
  "email": "student@example.com",
  "password": "secret123",
  "collegeId": "college_1",
  "departmentId": "dept_1",
  "sessionId": "session_1",
  "regNo": "20241001"
}
```

### Create resource
Request:
```json
{
  "uploaderId": "user_123",
  "uploaderRoleSnapshot": "STUDENT",
  "resourceType": "PYQ",
  "title": "Previous Year Question Paper",
  "description": "Semester 5 paper",
  "tags": ["pyq", "semester5"],
  "courseId": "course_1",
  "departmentId": "dept_1",
  "sessionId": "session_1",
  "visibility": "COLLEGE",
  "collegeId": "college_1"
}
```

### Report a resource
Request:
```json
{
  "reason": "SPAM",
  "note": "Duplicate upload"
}
```

### Admin override
Request:
```json
{
  "action": "PROMOTE_RESOURCE",
  "targetId": "resource_123",
  "justificationNote": "High quality content approved by platform admin",
  "reason": "Manual override"
}
```
