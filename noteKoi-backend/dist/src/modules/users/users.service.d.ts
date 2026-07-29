import type { UpdateProfileDto } from "./users.schema.js";
export declare function getProfile(userId: string): Promise<{
    classroomUnit: {
        department: {
            id: string;
            name: string;
        };
        id: string;
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
    } | null;
    classroomUnitId: string | null;
    college: {
        id: string;
        name: string;
    };
    collegeId: string;
    crAssignments: {
        classroomUnitId: string;
        seat: import("../../../generated/prisma/index.js").$Enums.CrSeat;
    }[];
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    role: import("../../../generated/prisma/index.js").$Enums.Role;
    verificationStatus: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
}>;
export declare function updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
    classroomUnit: {
        department: {
            id: string;
            name: string;
        };
        id: string;
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
    } | null;
    classroomUnitId: string | null;
    college: {
        id: string;
        name: string;
    };
    collegeId: string;
    crAssignments: {
        classroomUnitId: string;
        seat: import("../../../generated/prisma/index.js").$Enums.CrSeat;
    }[];
    createdAt: Date;
    email: string;
    id: string;
    name: string;
    role: import("../../../generated/prisma/index.js").$Enums.Role;
    verificationStatus: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
}>;
//# sourceMappingURL=users.service.d.ts.map