import { create } from "zustand";

export type UserRole =
  | "GUEST"
  | "STUDENT"
  | "TEACHER"
  | "CR"
  | "CO_CR"
  | "SUB_ADMIN"
  | "PLATFORM_ADMIN";

interface UserState {
  role: UserRole;
  isVerified: boolean;
  setRole: (role: UserRole) => void;
  setVerified: (value: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: "GUEST",
  isVerified: false,
  setRole: (role) => set({ role }),
  setVerified: (value) => set({ isVerified: value })
}));
