import type { CreateCollegeDto, UpdateCollegeDto, CreateDepartmentDto, UpdateDepartmentDto, CreateSemesterDto, UpdateSemesterDto, CreateCourseDto, UpdateCourseDto, CreateSessionDto, UpdateSessionDto, CreateClassroomUnitDto, PaginationDto } from "./hierarchy.schema.js";
export declare function listColleges(pagination: PaginationDto): Promise<{
    data: ({
        _count: {
            departments: number;
            users: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getCollege(id: string): Promise<{
    _count: {
        users: number;
    };
    departments: {
        id: string;
        name: string;
        collegeId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createCollege(dto: CreateCollegeDto): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCollege(id: string, dto: UpdateCollegeDto): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteCollege(id: string): Promise<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listDepartments(collegeId: string, pagination: PaginationDto): Promise<{
    data: ({
        _count: {
            semesters: number;
        };
    } & {
        id: string;
        name: string;
        collegeId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getDepartment(id: string): Promise<{
    college: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    };
    semesters: {
        id: string;
        name: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: string;
    name: string;
    collegeId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createDepartment(dto: CreateDepartmentDto): Promise<{
    id: string;
    name: string;
    collegeId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<{
    id: string;
    name: string;
    collegeId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteDepartment(id: string): Promise<{
    id: string;
    name: string;
    collegeId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listSemesters(departmentId: string, pagination: PaginationDto): Promise<{
    data: ({
        _count: {
            courses: number;
        };
    } & {
        id: string;
        name: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getSemester(id: string): Promise<{
    courses: {
        id: string;
        name: string;
        semesterId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    department: {
        id: string;
        name: string;
        collegeId: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    name: string;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createSemester(dto: CreateSemesterDto): Promise<{
    id: string;
    name: string;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateSemester(id: string, dto: UpdateSemesterDto): Promise<{
    id: string;
    name: string;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteSemester(id: string): Promise<{
    id: string;
    name: string;
    departmentId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listCourses(semesterId: string, pagination: PaginationDto): Promise<{
    data: ({
        _count: {
            sessions: number;
        };
    } & {
        id: string;
        name: string;
        semesterId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getCourse(id: string): Promise<{
    semester: {
        department: {
            id: string;
            name: string;
            collegeId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string;
        createdAt: Date;
        updatedAt: Date;
    };
    sessions: {
        id: string;
        name: string;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: string;
    name: string;
    semesterId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createCourse(dto: CreateCourseDto): Promise<{
    id: string;
    name: string;
    semesterId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCourse(id: string, dto: UpdateCourseDto): Promise<{
    id: string;
    name: string;
    semesterId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteCourse(id: string): Promise<{
    id: string;
    name: string;
    semesterId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listSessions(courseId: string, pagination: PaginationDto): Promise<{
    data: {
        id: string;
        name: string;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getSession(id: string): Promise<{
    course: {
        id: string;
        name: string;
        semesterId: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    name: string;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createSession(dto: CreateSessionDto): Promise<{
    id: string;
    name: string;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateSession(id: string, dto: UpdateSessionDto): Promise<{
    id: string;
    name: string;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteSession(id: string): Promise<{
    id: string;
    name: string;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listClassroomUnits(filter: {
    departmentId?: string;
    sessionId?: string;
}, pagination: PaginationDto): Promise<{
    data: ({
        _count: {
            crAssignments: number;
            users: number;
        };
        department: {
            id: string;
            name: string;
        };
        session: {
            course: {
                id: string;
                name: string;
                semester: {
                    id: string;
                    name: string;
                };
            };
            id: string;
            name: string;
        };
    } & {
        id: string;
        departmentId: string;
        sessionId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getClassroomUnit(id: string): Promise<{
    crAssignments: ({
        user: {
            email: string;
            id: string;
            name: string;
        };
    } & {
        id: string;
        userId: string;
        classroomUnitId: string;
        seat: import("../../../generated/prisma/index.js").$Enums.CrSeat;
        isActive: boolean;
        assignedById: string;
        createdAt: Date;
        updatedAt: Date;
        revokedAt: Date | null;
    })[];
    department: {
        college: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        collegeId: string;
        createdAt: Date;
        updatedAt: Date;
    };
    session: {
        course: {
            semester: {
                id: string;
                name: string;
                departmentId: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            name: string;
            semesterId: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    departmentId: string;
    sessionId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function createClassroomUnit(dto: CreateClassroomUnitDto): Promise<{
    id: string;
    departmentId: string;
    sessionId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteClassroomUnit(id: string): Promise<{
    id: string;
    departmentId: string;
    sessionId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=hierarchy.service.d.ts.map