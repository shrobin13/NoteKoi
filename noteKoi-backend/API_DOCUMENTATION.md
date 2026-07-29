# noteKoi Backend - Complete API Documentation

This document provides complete specification for all REST API endpoints provided by the `noteKoi` backend server.

---

## 📋 Table of Contents

1. [Overview & Base URL](#overview--base-url)
2. [Authentication & Authorization](#authentication--authorization)
3. [Global Response & Error Envelopes](#global-response--error-envelopes)
4. [Enums & Data Models](#enums--data-models)
5. [API Routes](#api-routes)
   - [Health Check](#1-health-check)
   - [Authentication (`/api/auth`)](#2-authentication-apiauth)
   - [Users (`/api/users`)](#3-users-apiusers)
   - [Hierarchy (`/api/hierarchy`)](#4-hierarchy-apihierarchy)
     - [Colleges](#colleges)
     - [Departments](#departments)
     - [Semesters](#semesters)
     - [Courses](#courses)
     - [Sessions](#sessions)
     - [Classroom Units](#classroom-units)
   - [Admin (`/api/admin`)](#5-admin-apiadmin)
   - [Class Representative - CR (`/api/cr`)](#6-class-representative---cr-apicr)
   - [Verification (`/api/verification`)](#7-verification-apiverification)
   - [Resources (`/api/resources`)](#8-resources-apiresources)

---

## 🌐 Overview & Base URL

- **Default Server Port**: `5000` (configurable via `PORT` environment variable)
- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api`
- **Content-Type**: `application/json` (unless specified otherwise)

---

## 🔒 Authentication & Authorization

Most endpoints require authentication via JSON Web Tokens (JWT). Include the JWT in the `Authorization` request header as a Bearer token:

```http
Authorization: Bearer <accessToken>
```

### Role-Based Access Control (RBAC) Hierarchy

1. **`OWNER_ADMIN`**: Full platform authority across all colleges, departments, resources, and administrative roles.
2. **`SUB_ADMIN`**: Admin authority scoped to their assigned `collegeId`.
3. **`CR` (Class Representative)**: Management authority for resources and student verifications within their assigned `classroomUnitId`.
4. **`STUDENT`**: Base user access to public/unit resources and profile management.

---

## ✉️ Global Response & Error Envelopes

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation description (optional)",
  "data": { ... }
}
```

### Standard Paginated Success Response

```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Human readable error message",
  "code": "ERROR_CODE"
}
```

### Validation Error Response (HTTP 400)

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": [
      "Invalid email"
    ],
    "password": [
      "Password must be at least 8 characters"
    ]
  }
}
```

---

## 🏷️ Enums & Data Models

### User Roles (`Role`)
- `STUDENT`
- `CR`
- `SUB_ADMIN`
- `OWNER_ADMIN`

### User Status (`UserStatus`)
- `UNVERIFIED`
- `VERIFIED`
- `SUSPENDED`

### CR Seats (`CrSeat`)
- `PRIMARY`
- `SECONDARY`

### Resource Visibility (`Visibility`)
- `PUBLIC`
- `PRIVATE`

### Resource Categories (`Category`)
- `Lecture`
- `Notes`
- `PYQ`
- `Tutorial`
- `Software`
- `Other`

---

## 🚀 API Routes

---

### 1. Health Check

#### `GET /health`
Returns system operational status and timestamp.

- **Authentication**: None (Public)
- **Rate Limit**: Global limiter

##### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-07-29T17:00:00.000Z",
  "service": "noteKoi-backend"
}
```

---

### 2. Authentication (`/api/auth`)

#### `POST /api/auth/register`
Register a new student account. Account is created in `UNVERIFIED` status.

- **Authentication**: None (Public)
- **Rate Limit**: Auth limiter

##### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123",
  "collegeId": "cm1234567890collegesample",
  "classroomUnitId": "cm1234567890unitsample"
}
```

##### Response (201 Created)
```json
{
  "success": true,
  "message": "Registration successful. Awaiting verification.",
  "data": {
    "user": {
      "id": "cm1234567890usersample",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "STUDENT",
      "status": "UNVERIFIED",
      "collegeId": "cm1234567890collegesample",
      "classroomUnitId": "cm1234567890unitsample",
      "createdAt": "2026-07-29T17:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

#### `POST /api/auth/login`
Authenticate existing user and retrieve access tokens.

- **Authentication**: None (Public)
- **Rate Limit**: Auth limiter

##### Request Body
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm1234567890usersample",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "STUDENT",
      "status": "UNVERIFIED",
      "collegeId": "cm1234567890collegesample",
      "classroomUnitId": "cm1234567890unitsample"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

---

#### `POST /api/auth/refresh`
Generate a new access & refresh token pair using a valid refresh token.

- **Authentication**: None (Public)
- **Rate Limit**: Auth limiter

##### Request Body
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

---

#### `POST /api/auth/logout`
Log out user (stateless endpoint for client token cleanup).

- **Authentication**: Bearer Token required
- **Request Body**: None

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 3. Users (`/api/users`)

#### `GET /api/users/me`
Retrieve profile of currently authenticated user.

- **Authentication**: Bearer Token required

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm1234567890usersample",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "STUDENT",
    "status": "VERIFIED",
    "collegeId": "cm1234567890collegesample",
    "classroomUnitId": "cm1234567890unitsample",
    "createdAt": "2026-07-29T17:00:00.000Z"
  }
}
```

---

#### `PATCH /api/users/me`
Update profile details for current user.

- **Authentication**: Bearer Token required

##### Request Body
```json
{
  "name": "Jane Smith"
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "cm1234567890usersample",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "STUDENT",
    "status": "VERIFIED"
  }
}
```

---

#### `GET /api/users/:userId`
Fetch profile details for another user by ID (read-only profile view).

- **Authentication**: Bearer Token required
- **Path Parameter**: `userId` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm1234567890targetuser",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "CR",
    "status": "VERIFIED"
  }
}
```

---

### 4. Hierarchy (`/api/hierarchy`)

#### Colleges

##### `GET /api/hierarchy/colleges`
List colleges with optional pagination.
- **Auth**: None (Public)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)

##### `GET /api/hierarchy/colleges/:id`
Get single college by ID.
- **Auth**: None (Public)

##### `POST /api/hierarchy/colleges`
Create a new college.
- **Auth**: Bearer Token required (`OWNER_ADMIN` role)
- **Body**: `{ "name": "Faculty of Science" }`

##### `PATCH /api/hierarchy/colleges/:id`
Update college name.
- **Auth**: Bearer Token required (`OWNER_ADMIN` role)
- **Body**: `{ "name": "Faculty of Science & Tech" }`

##### `DELETE /api/hierarchy/colleges/:id`
Delete a college.
- **Auth**: Bearer Token required (`OWNER_ADMIN` role)

---

#### Departments

##### `GET /api/hierarchy/colleges/:collegeId/departments`
List departments within a college.
- **Auth**: None (Public)
- **Query Parameters**: `page`, `limit`

##### `GET /api/hierarchy/departments/:id`
Get single department by ID.
- **Auth**: None (Public)

##### `POST /api/hierarchy/departments`
Create a new department.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN` scoped to college)
- **Body**:
  ```json
  {
    "name": "Computer Science & Engineering",
    "collegeId": "cm1234567890collegesample"
  }
  ```

##### `PATCH /api/hierarchy/departments/:id`
Update department name.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN` scoped)

##### `DELETE /api/hierarchy/departments/:id`
Delete a department.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN` scoped)

---

#### Semesters

##### `GET /api/hierarchy/departments/:departmentId/semesters`
List semesters in a department.
- **Auth**: None (Public)

##### `GET /api/hierarchy/semesters/:id`
Get semester details.
- **Auth**: None (Public)

##### `POST /api/hierarchy/semesters`
Create semester.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)
- **Body**: `{ "name": "Semester 1", "departmentId": "cm12345..." }`

##### `PATCH /api/hierarchy/semesters/:id`
Update semester.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

##### `DELETE /api/hierarchy/semesters/:id`
Delete semester.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

---

#### Courses

##### `GET /api/hierarchy/semesters/:semesterId/courses`
List courses under a semester.
- **Auth**: None (Public)

##### `GET /api/hierarchy/courses/:id`
Get course details.
- **Auth**: None (Public)

##### `POST /api/hierarchy/courses`
Create course.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)
- **Body**: `{ "name": "Data Structures & Algorithms", "semesterId": "cm12345..." }`

##### `PATCH /api/hierarchy/courses/:id`
Update course.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

##### `DELETE /api/hierarchy/courses/:id`
Delete course.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

---

#### Sessions

##### `GET /api/hierarchy/courses/:courseId/sessions`
List academic sessions for a course.
- **Auth**: None (Public)

##### `GET /api/hierarchy/sessions/:id`
Get session details.
- **Auth**: None (Public)

##### `POST /api/hierarchy/sessions`
Create academic session.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)
- **Body**: `{ "name": "2024-2025", "courseId": "cm12345..." }`

##### `PATCH /api/hierarchy/sessions/:id`
Update session name.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

##### `DELETE /api/hierarchy/sessions/:id`
Delete session.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

---

#### Classroom Units

##### `GET /api/hierarchy/classroom-units`
List all classroom units.
- **Auth**: None (Public)

##### `GET /api/hierarchy/classroom-units/:id`
Get single classroom unit details (includes department and session information).
- **Auth**: None (Public)

##### `POST /api/hierarchy/classroom-units`
Create a classroom unit linking a department and session.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)
- **Body**:
  ```json
  {
    "departmentId": "cm1234567890deptsample",
    "sessionId": "cm1234567890sessionsample"
  }
  ```

##### `DELETE /api/hierarchy/classroom-units/:id`
Delete classroom unit.
- **Auth**: Bearer Token required (`OWNER_ADMIN` or `SUB_ADMIN`)

---

### 5. Admin (`/api/admin`)

All endpoints in this section require `OWNER_ADMIN` authentication.

#### `GET /api/admin/sub-admins`
List all active Sub Admins across the platform.

- **Authentication**: Bearer Token required (`OWNER_ADMIN`)

##### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cm1234567890subadmin1",
      "name": "Sub Admin User",
      "email": "subadmin@example.com",
      "role": "SUB_ADMIN",
      "collegeId": "cm1234567890collegesample"
    }
  ]
}
```

---

#### `POST /api/admin/sub-admins`
Promote a user to `SUB_ADMIN` assigned to a specific college.

- **Authentication**: Bearer Token required (`OWNER_ADMIN`)

##### Request Body
```json
{
  "userId": "cm1234567890usersample",
  "collegeId": "cm1234567890collegesample"
}
```

##### Response (201 Created)
```json
{
  "success": true,
  "message": "Sub Admin assigned successfully",
  "data": {
    "id": "cm1234567890usersample",
    "role": "SUB_ADMIN",
    "collegeId": "cm1234567890collegesample"
  }
}
```

---

#### `DELETE /api/admin/sub-admins/:userId`
Demote a Sub Admin back to `STUDENT` and remove college assignment.

- **Authentication**: Bearer Token required (`OWNER_ADMIN`)
- **Path Parameter**: `userId` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Sub Admin demoted successfully",
  "data": null
}
```

---

#### `POST /api/admin/transfer-ownership`
Transfer platform ownership atomically to another user. Standard Owner Admin becomes `STUDENT`.

- **Authentication**: Bearer Token required (`OWNER_ADMIN`)

##### Request Body
```json
{
  "newOwnerUserId": "cm1234567890newowner"
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Ownership transferred successfully",
  "data": null
}
```

---

#### `GET /api/admin/stats`
Retrieve system-wide analytics and entity counts.

- **Authentication**: Bearer Token required (`OWNER_ADMIN`)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalColleges": 5,
    "totalDepartments": 12,
    "totalClassroomUnits": 24,
    "totalResources": 340,
    "pendingVerifications": 8
  }
}
```

---

### 6. Class Representative - CR (`/api/cr`)

#### `GET /api/cr/:classroomUnitId`
List active CRs allocated to a classroom unit.

- **Authentication**: Bearer Token required
- **Path Parameter**: `classroomUnitId` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cm1234567890cruser1",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "crSeat": "PRIMARY",
      "classroomUnitId": "cm1234567890unit1"
    }
  ]
}
```

---

#### `POST /api/cr/assign`
Assign CR role and seat (`PRIMARY` or `SECONDARY`) to a student in a classroom unit.

- **Authentication**: Bearer Token required (`SUB_ADMIN` of that college or `OWNER_ADMIN`)

##### Request Body
```json
{
  "userId": "cm1234567890usersample",
  "classroomUnitId": "cm1234567890unit1",
  "seat": "PRIMARY"
}
```

##### Response (201 Created)
```json
{
  "success": true,
  "message": "CR assigned successfully",
  "data": {
    "id": "cm1234567890usersample",
    "role": "CR",
    "crSeat": "PRIMARY"
  }
}
```

---

#### `DELETE /api/cr/demote`
Demote CR back to `STUDENT` role and clear their seat allocation.

- **Authentication**: Bearer Token required (`SUB_ADMIN` of that college or `OWNER_ADMIN`)

##### Request Body
```json
{
  "userId": "cm1234567890cruser1",
  "classroomUnitId": "cm1234567890unit1"
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "CR demoted successfully",
  "data": null
}
```

---

### 7. Verification (`/api/verification`)

#### `POST /api/verification/request`
Submit request for account verification under a classroom unit.

- **Authentication**: Bearer Token required (Any authenticated user)

##### Request Body
```json
{
  "classroomUnitId": "cm1234567890unit1"
}
```

##### Response (201 Created)
```json
{
  "success": true,
  "message": "Verification request submitted",
  "data": {
    "id": "cm1234567890reqsample",
    "userId": "cm1234567890usersample",
    "classroomUnitId": "cm1234567890unit1",
    "status": "PENDING",
    "createdAt": "2026-07-29T17:00:00.000Z"
  }
}
```

---

#### `GET /api/verification/pending`
View pending verification requests within the approver's scope (CR: own unit, Sub Admin: own college, Owner Admin: platform).

- **Authentication**: Bearer Token required (`CR`, `SUB_ADMIN`, `OWNER_ADMIN`)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cm1234567890reqsample",
        "user": {
          "id": "cm1234567890usersample",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "classroomUnit": {
          "id": "cm1234567890unit1",
          "department": { "name": "CSE" }
        },
        "createdAt": "2026-07-29T17:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### `POST /api/verification/approve/:requestId`
Approve pending student verification request. Marks student as `VERIFIED`.

- **Authentication**: Bearer Token required (`CR`, `SUB_ADMIN`, `OWNER_ADMIN`)
- **Path Parameter**: `requestId` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Verification approved",
  "data": {
    "id": "cm1234567890reqsample",
    "status": "APPROVED",
    "verifiedBy": "cm1234567890approver",
    "verifiedAt": "2026-07-29T17:01:00.000Z"
  }
}
```

---

### 8. Resources (`/api/resources`)

#### `GET /api/resources/public`
Search and filter public educational resources across all colleges.

- **Authentication**: None (Public)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
  - `search` (string, optional, search title)
  - `category` (string, optional: `"Lecture" | "Notes" | "PYQ" | "Tutorial" | "Software" | "Other"`)
  - `courseId` (CUID, optional)
  - `departmentId` (CUID, optional)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cm1234567890res1",
        "title": "Algorithms Lecture 1 Notes",
        "category": "Notes",
        "visibility": "PUBLIC",
        "fileId": "1gDriveFileIdSample",
        "fileUrl": "https://drive.google.com/file/d/1gDriveFileIdSample/view",
        "previewUrl": "https://drive.google.com/file/d/1gDriveFileIdSample/preview",
        "classroomUnitId": "cm1234567890unit1",
        "createdAt": "2026-07-29T17:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### `GET /api/resources/unit/:classroomUnitId`
Retrieve resources scoped to a specific classroom unit (`VERIFIED` accounts only).

- **Authentication**: Bearer Token required (`VERIFIED` user within unit scope or higher admin)
- **Path Parameter**: `classroomUnitId` (CUID)
- **Query Parameters**: `page`, `limit`, `search`, `category`, `courseId`

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "meta": { ... }
  }
}
```

---

#### `GET /api/resources/:id`
Fetch a specific resource by ID. Soft authentication determines access for `PRIVATE` resources.

- **Authentication**: Public for `PUBLIC` resources; Bearer Token required (`VERIFIED` account) for `PRIVATE` resources
- **Path Parameter**: `id` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "cm1234567890res1",
    "title": "Algorithms Exam Revision",
    "category": "PYQ",
    "visibility": "PRIVATE",
    "fileId": "1gDriveFileIdSample",
    "fileUrl": "https://drive.google.com/file/d/1gDriveFileIdSample/view",
    "previewUrl": "https://drive.google.com/file/d/1gDriveFileIdSample/preview",
    "classroomUnitId": "cm1234567890unit1"
  }
}
```

---

#### `POST /api/resources`
Create and upload a new resource into a classroom unit.

- **Authentication**: Bearer Token required (`VERIFIED` account + `CR` role for the unit)

##### Request Body
```json
{
  "title": "Database Systems Quiz 1",
  "category": "PYQ",
  "visibility": "PRIVATE",
  "fileId": "1DriveFileIdXYZ123",
  "fileUrl": "https://drive.google.com/file/d/1DriveFileIdXYZ123/view",
  "previewUrl": "https://drive.google.com/file/d/1DriveFileIdXYZ123/preview",
  "courseId": "cm1234567890course1",
  "classroomUnitId": "cm1234567890unit1"
}
```

##### Response (201 Created)
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "id": "cm1234567890res2",
    "title": "Database Systems Quiz 1",
    "category": "PYQ",
    "visibility": "PRIVATE",
    "fileId": "1DriveFileIdXYZ123",
    "fileUrl": "https://drive.google.com/file/d/1DriveFileIdXYZ123/view",
    "classroomUnitId": "cm1234567890unit1"
  }
}
```

---

#### `PATCH /api/resources/:id`
Update an existing resource.

- **Authentication**: Bearer Token required (`VERIFIED` account + `CR` role for the unit)
- **Path Parameter**: `id` (CUID)

##### Request Body (all fields optional)
```json
{
  "title": "Database Systems Quiz 1 (Updated)",
  "visibility": "PUBLIC"
}
```

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "data": {
    "id": "cm1234567890res2",
    "title": "Database Systems Quiz 1 (Updated)",
    "visibility": "PUBLIC"
  }
}
```

---

#### `DELETE /api/resources/:id`
Delete a resource.

- **Authentication**: Bearer Token required (`VERIFIED` account + `CR` role for the unit)
- **Path Parameter**: `id` (CUID)

##### Response (200 OK)
```json
{
  "success": true,
  "message": "Resource deleted successfully",
  "data": null
}
```
