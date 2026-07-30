import apiClient from "./api";
import type {
  College,
  Department,
  Semester,
  Course,
  Session,
  ClassroomUnit,
  PaginatedResponse,
} from "./types";

// ── Colleges ──────────────────────────────────────────────────────────────
export async function getColleges(page = 1, limit = 20): Promise<PaginatedResponse<College>> {
  const { data } = await apiClient.get("/api/hierarchy/colleges", {
    params: { page, limit },
  });
  return data.data as PaginatedResponse<College>;
}

export async function getCollege(id: string): Promise<College> {
  const { data } = await apiClient.get(`/api/hierarchy/colleges/${id}`);
  return data.data as College;
}

export async function createCollege(name: string): Promise<College> {
  const { data } = await apiClient.post("/api/hierarchy/colleges", { name });
  return data.data as College;
}

export async function updateCollege(id: string, name: string): Promise<College> {
  const { data } = await apiClient.patch(`/api/hierarchy/colleges/${id}`, { name });
  return data.data as College;
}

export async function deleteCollege(id: string): Promise<void> {
  await apiClient.delete(`/api/hierarchy/colleges/${id}`);
}

// ── Departments ───────────────────────────────────────────────────────────
export async function getDepartments(collegeId: string, page = 1, limit = 20): Promise<PaginatedResponse<Department>> {
  const { data } = await apiClient.get(`/api/hierarchy/colleges/${collegeId}/departments`, {
    params: { page, limit },
  });
  return data.data as PaginatedResponse<Department>;
}

export async function getDepartment(id: string): Promise<Department> {
  const { data } = await apiClient.get(`/api/hierarchy/departments/${id}`);
  return data.data as Department;
}

export async function createDepartment(payload: { name: string; collegeId: string }): Promise<Department> {
  const { data } = await apiClient.post("/api/hierarchy/departments", payload);
  return data.data as Department;
}

export async function updateDepartment(id: string, name: string): Promise<Department> {
  const { data } = await apiClient.patch(`/api/hierarchy/departments/${id}`, { name });
  return data.data as Department;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`/api/hierarchy/departments/${id}`);
}

// ── Semesters ─────────────────────────────────────────────────────────────
export async function getSemesters(departmentId: string): Promise<Semester[]> {
  const { data } = await apiClient.get(`/api/hierarchy/departments/${departmentId}/semesters`);
  const res = data.data as any;
  return (Array.isArray(res) ? res : res?.data ?? []) as Semester[];
}

export async function getSemester(id: string): Promise<Semester> {
  const { data } = await apiClient.get(`/api/hierarchy/semesters/${id}`);
  return data.data as Semester;
}

export async function createSemester(payload: { name: string; departmentId: string }): Promise<Semester> {
  const { data } = await apiClient.post("/api/hierarchy/semesters", payload);
  return data.data as Semester;
}

export async function updateSemester(id: string, name: string): Promise<Semester> {
  const { data } = await apiClient.patch(`/api/hierarchy/semesters/${id}`, { name });
  return data.data as Semester;
}

export async function deleteSemester(id: string): Promise<void> {
  await apiClient.delete(`/api/hierarchy/semesters/${id}`);
}

// ── Courses ───────────────────────────────────────────────────────────────
export async function getCourses(semesterId: string): Promise<Course[]> {
  const { data } = await apiClient.get(`/api/hierarchy/semesters/${semesterId}/courses`);
  const res = data.data as any;
  return (Array.isArray(res) ? res : res?.data ?? []) as Course[];
}

export async function getCourse(id: string): Promise<Course> {
  const { data } = await apiClient.get(`/api/hierarchy/courses/${id}`);
  return data.data as Course;
}

export async function createCourse(payload: { name: string; semesterId: string }): Promise<Course> {
  const { data } = await apiClient.post("/api/hierarchy/courses", payload);
  return data.data as Course;
}

export async function updateCourse(id: string, name: string): Promise<Course> {
  const { data } = await apiClient.patch(`/api/hierarchy/courses/${id}`, { name });
  return data.data as Course;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/api/hierarchy/courses/${id}`);
}

// ── Sessions ──────────────────────────────────────────────────────────────
export async function getSessions(courseId: string): Promise<Session[]> {
  const { data } = await apiClient.get(`/api/hierarchy/courses/${courseId}/sessions`);
  const res = data.data as any;
  return (Array.isArray(res) ? res : res?.data ?? []) as Session[];
}

export async function getSession(id: string): Promise<Session> {
  const { data } = await apiClient.get(`/api/hierarchy/sessions/${id}`);
  return data.data as Session;
}

export async function createSession(payload: { name: string; courseId: string }): Promise<Session> {
  const { data } = await apiClient.post("/api/hierarchy/sessions", payload);
  return data.data as Session;
}

// ── Classroom Units ───────────────────────────────────────────────────────
/**
 * Fetch classroom units, optionally scoped to a specific college.
 *
 * When collegeId is provided the call first retrieves all departments for that
 * college (all pages up to 200) and then fetches classroom units that belong
 * to those department IDs. The backend /classroom-units endpoint only supports
 * departmentId filtering, so we resolve the college → departments mapping here
 * on the client to keep the backend simple.
 *
 * Without collegeId this falls back to a global fetch (useful for admins).
 */
export async function getClassroomUnits(collegeId?: string): Promise<ClassroomUnit[]> {
  const { data } = await apiClient.get("/api/hierarchy/classroom-units", {
    params: { ...(collegeId ? { collegeId } : {}), limit: 200 },
  });
  const res = data.data as any;
  return (Array.isArray(res) ? res : res?.data ?? []) as ClassroomUnit[];
}

export async function getClassroomUnit(id: string): Promise<ClassroomUnit> {
  const { data } = await apiClient.get(`/api/hierarchy/classroom-units/${id}`);
  return data.data as ClassroomUnit;
}

export async function createClassroomUnit(payload: { departmentId: string; sessionId: string }): Promise<ClassroomUnit> {
  const { data } = await apiClient.post("/api/hierarchy/classroom-units", payload);
  return data.data as ClassroomUnit;
}

export async function deleteClassroomUnit(id: string): Promise<void> {
  await apiClient.delete(`/api/hierarchy/classroom-units/${id}`);
}

// ── Bootstrap (one-shot wizard) ──────────────────────────────────────────────────

/** Creates College → Department → Semester → Course → Session → ClassroomUnit */
export async function bootstrapCollege(payload: {
  collegeName: string;
  departmentName: string;
  sessionLabel: string;
}): Promise<{ college: College; department: Department; classroomUnit: ClassroomUnit }> {
  const { data } = await apiClient.post("/api/hierarchy/bootstrap", payload);
  return data.data as { college: College; department: Department; classroomUnit: ClassroomUnit };
}

/** Adds a new Session + ClassroomUnit to an existing department */
export async function addClassroomUnitToDept(
  departmentId: string,
  sessionLabel: string,
): Promise<{ classroomUnit: ClassroomUnit }> {
  const { data } = await apiClient.post(
    `/api/hierarchy/departments/${departmentId}/classroom-units`,
    { sessionLabel },
  );
  return data.data as { classroomUnit: ClassroomUnit };
}
