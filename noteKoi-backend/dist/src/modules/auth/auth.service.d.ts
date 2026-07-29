import type { RegisterDto, LoginDto } from "./auth.schema.js";
export declare function register(dto: RegisterDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
        verificationStatus: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        collegeId: string;
        classroomUnitId: string | null;
    };
}>;
export declare function login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
        verificationStatus: import("../../../generated/prisma/index.js").$Enums.VerificationStatus;
        collegeId: string;
        classroomUnitId: string | null;
    };
}>;
export declare function refresh(token: string): {
    userId: string;
    newRefreshToken: string;
};
export declare function refreshWithUser(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
//# sourceMappingURL=auth.service.d.ts.map