import { Request, Response, NextFunction } from "express";
import * as svc from "./hierarchy.service.js";
import { success, ApiError, getParam } from "../../types/index.js";

// ─── Colleges ────────────────────────────────────────────────────────────────

export async function listColleges(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.listColleges(req.query as any))); } catch (e) { next(e); }
}
export async function getCollege(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getCollege(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createCollege(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createCollege(req.body), "College created")); } catch (e) { next(e); }
}
export async function updateCollege(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.updateCollege(getParam(req, "id"), req.body), "College updated")); } catch (e) { next(e); }
}
export async function deleteCollege(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteCollege(getParam(req, "id")); res.json(success(null, "College deleted")); } catch (e) { next(e); }
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function listDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const collegeId = getParam(req, "collegeId");
    if (!collegeId) return next(ApiError.badRequest("collegeId required"));
    res.json(success(await svc.listDepartments(collegeId, req.query as any)));
  } catch (e) { next(e); }
}
export async function getDepartment(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getDepartment(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createDepartment(req.body), "Department created")); } catch (e) { next(e); }
}
export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.updateDepartment(getParam(req, "id"), req.body), "Department updated")); } catch (e) { next(e); }
}
export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteDepartment(getParam(req, "id")); res.json(success(null, "Department deleted")); } catch (e) { next(e); }
}

// ─── Semesters ───────────────────────────────────────────────────────────────

export async function listSemesters(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = getParam(req, "departmentId");
    if (!departmentId) return next(ApiError.badRequest("departmentId required"));
    res.json(success(await svc.listSemesters(departmentId, req.query as any)));
  } catch (e) { next(e); }
}
export async function getSemester(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getSemester(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createSemester(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createSemester(req.body), "Semester created")); } catch (e) { next(e); }
}
export async function updateSemester(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.updateSemester(getParam(req, "id"), req.body), "Semester updated")); } catch (e) { next(e); }
}
export async function deleteSemester(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteSemester(getParam(req, "id")); res.json(success(null, "Semester deleted")); } catch (e) { next(e); }
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function listCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const semesterId = getParam(req, "semesterId");
    if (!semesterId) return next(ApiError.badRequest("semesterId required"));
    res.json(success(await svc.listCourses(semesterId, req.query as any)));
  } catch (e) { next(e); }
}
export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getCourse(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createCourse(req.body), "Course created")); } catch (e) { next(e); }
}
export async function updateCourse(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.updateCourse(getParam(req, "id"), req.body), "Course updated")); } catch (e) { next(e); }
}
export async function deleteCourse(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteCourse(getParam(req, "id")); res.json(success(null, "Course deleted")); } catch (e) { next(e); }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = getParam(req, "courseId");
    if (!courseId) return next(ApiError.badRequest("courseId required"));
    res.json(success(await svc.listSessions(courseId, req.query as any)));
  } catch (e) { next(e); }
}
export async function getSession(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getSession(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createSession(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createSession(req.body), "Session created")); } catch (e) { next(e); }
}
export async function updateSession(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.updateSession(getParam(req, "id"), req.body), "Session updated")); } catch (e) { next(e); }
}
export async function deleteSession(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteSession(getParam(req, "id")); res.json(success(null, "Session deleted")); } catch (e) { next(e); }
}

// ─── ClassroomUnits ───────────────────────────────────────────────────────────

export async function listClassroomUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, sessionId, collegeId } = req.query as { departmentId?: string; sessionId?: string; collegeId?: string };
    res.json(success(await svc.listClassroomUnits({ departmentId, sessionId, collegeId }, req.query as any)));
  } catch (e) { next(e); }
}
export async function getClassroomUnit(req: Request, res: Response, next: NextFunction) {
  try { res.json(success(await svc.getClassroomUnit(getParam(req, "id")))); } catch (e) { next(e); }
}
export async function createClassroomUnit(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(success(await svc.createClassroomUnit(req.body), "ClassroomUnit created")); } catch (e) { next(e); }
}
export async function deleteClassroomUnit(req: Request, res: Response, next: NextFunction) {
  try { await svc.deleteClassroomUnit(getParam(req, "id")); res.json(success(null, "ClassroomUnit deleted")); } catch (e) { next(e); }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────────

export async function bootstrapCollege(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(success(await svc.bootstrapCollege(req.body), "College bootstrapped successfully"));
  } catch (e) { next(e); }
}

export async function addClassroomUnitToDept(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = getParam(req, "departmentId");
    res.status(201).json(success(
      await svc.addClassroomUnitToExistingDept(departmentId, req.body),
      "Classroom unit added",
    ));
  } catch (e) { next(e); }
}
