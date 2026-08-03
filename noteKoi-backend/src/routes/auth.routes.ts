import express, { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller.js";
import { registerStudentHandler, registerTeacherHandler } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator.js";
import { studentRegistrationSchema, teacherRegistrationSchema } from "../validators/user.validator.js";
import { csrfGuard } from "../middlewares/csrfGuard.js";

const router: express.Router = Router();

router.post("/login", validate({ body: loginSchema }), loginHandler);
router.post("/register/student", validate({ body: studentRegistrationSchema }), registerStudentHandler);
router.post("/register/teacher", validate({ body: teacherRegistrationSchema }), registerTeacherHandler);
router.post("/refresh", csrfGuard, refreshHandler);
router.post("/logout", csrfGuard, logoutHandler);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), forgotPasswordHandler);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetPasswordHandler);

export default router;
