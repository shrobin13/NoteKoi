import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { requireScope } from "../../middlewares/requireScope.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import {
  CreateCollegeSchema,
  UpdateCollegeSchema,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  CreateSemesterSchema,
  UpdateSemesterSchema,
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateSessionSchema,
  UpdateSessionSchema,
  CreateClassroomUnitSchema,
  PaginationSchema,
} from "./hierarchy.schema.js";
import * as ctrl from "./hierarchy.controller.js";

const router: Router = Router();

// ─── Colleges ─────────────────────────────────────────────────────────────────
// Public: list & get. Write: Owner Admin only.
router.get("/colleges", validateWithDetails(PaginationSchema, "query"), ctrl.listColleges);
router.get("/colleges/:id", ctrl.getCollege);
router.post(
  "/colleges",
  authenticate(),
  requireRole(Role.OWNER_ADMIN),
  validateWithDetails(CreateCollegeSchema),
  ctrl.createCollege,
);
router.patch(
  "/colleges/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN),
  validateWithDetails(UpdateCollegeSchema),
  ctrl.updateCollege,
);
router.delete(
  "/colleges/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN),
  ctrl.deleteCollege,
);

// ─── Departments ──────────────────────────────────────────────────────────────
// Public: list & get. Write: Owner Admin or Sub Admin of that college.
router.get(
  "/colleges/:collegeId/departments",
  validateWithDetails(PaginationSchema, "query"),
  ctrl.listDepartments,
);
router.get("/departments/:id", ctrl.getDepartment);
router.post(
  "/departments",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  requireScope("college"),
  validateWithDetails(CreateDepartmentSchema),
  ctrl.createDepartment,
);
router.patch(
  "/departments/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(UpdateDepartmentSchema),
  ctrl.updateDepartment,
);
router.delete(
  "/departments/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  ctrl.deleteDepartment,
);

// ─── Semesters ────────────────────────────────────────────────────────────────
router.get(
  "/departments/:departmentId/semesters",
  validateWithDetails(PaginationSchema, "query"),
  ctrl.listSemesters,
);
router.get("/semesters/:id", ctrl.getSemester);
router.post(
  "/semesters",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(CreateSemesterSchema),
  ctrl.createSemester,
);
router.patch(
  "/semesters/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(UpdateSemesterSchema),
  ctrl.updateSemester,
);
router.delete(
  "/semesters/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  ctrl.deleteSemester,
);

// ─── Courses ──────────────────────────────────────────────────────────────────
router.get(
  "/semesters/:semesterId/courses",
  validateWithDetails(PaginationSchema, "query"),
  ctrl.listCourses,
);
router.get("/courses/:id", ctrl.getCourse);
router.post(
  "/courses",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(CreateCourseSchema),
  ctrl.createCourse,
);
router.patch(
  "/courses/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(UpdateCourseSchema),
  ctrl.updateCourse,
);
router.delete(
  "/courses/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  ctrl.deleteCourse,
);

// ─── Sessions ─────────────────────────────────────────────────────────────────
router.get(
  "/courses/:courseId/sessions",
  validateWithDetails(PaginationSchema, "query"),
  ctrl.listSessions,
);
router.get("/sessions/:id", ctrl.getSession);
router.post(
  "/sessions",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(CreateSessionSchema),
  ctrl.createSession,
);
router.patch(
  "/sessions/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(UpdateSessionSchema),
  ctrl.updateSession,
);
router.delete(
  "/sessions/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  ctrl.deleteSession,
);

// ─── ClassroomUnits ───────────────────────────────────────────────────────────
router.get(
  "/classroom-units",
  validateWithDetails(PaginationSchema, "query"),
  ctrl.listClassroomUnits,
);
router.get("/classroom-units/:id", ctrl.getClassroomUnit);
router.post(
  "/classroom-units",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  validateWithDetails(CreateClassroomUnitSchema),
  ctrl.createClassroomUnit,
);
router.delete(
  "/classroom-units/:id",
  authenticate(),
  requireRole(Role.OWNER_ADMIN, Role.SUB_ADMIN),
  ctrl.deleteClassroomUnit,
);

export default router;
