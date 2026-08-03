import { request } from "./client";
import type { Course } from "@/lib/types";

export async function getCoursesByDepartment(departmentId: string): Promise<Course[]> {
  return request<Course[]>(`/api/v1/departments/${departmentId}/courses`);
}

export interface CreateCoursePayload {
  departmentId: string;
  name: string;
  description?: string | null;
}

export async function createCourse(departmentId: string, payload: CreateCoursePayload): Promise<Course> {
  return request<Course>(`/api/v1/departments/${departmentId}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export interface UpdateCoursePayload {
  name?: string;
  description?: string | null;
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  return request<Course>(`/api/v1/courses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
