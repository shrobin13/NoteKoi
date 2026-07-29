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
  return data.data as Semester[];
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
  return data.data as Course[];
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
  return data.data as Session[];
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
export async function getClassroomUnits(): Promise<ClassroomUnit[]> {
  const { data } = await apiClient.get("/api/hierarchy/classroom-units");
  return data.data as ClassroomUnit[];
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
