import api from "./api";
import type { ApiResponse, LoginPayload, RegisterPayload, RegisterCompletePayload, User } from "@/types";

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ token: string; user: User }>>("/auth/register", payload).then((r) => r.data),

  registerComplete: (payload: RegisterCompletePayload) =>
    api.post<ApiResponse<{ token: string; user: User }>>("/auth/register-complete", payload).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<{ token: string }>>("/auth/reset-password", { token, password }).then((r) => r.data),

  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string; isActive?: boolean; approvalStatus?: string }) =>
    api.get<ApiResponse<User[]>>("/auth/users", { params }).then((r) => r.data),

  updateUserRole: (id: string, role: string) =>
    api.patch<ApiResponse<User>>(`/auth/users/${id}/role`, { role }).then((r) => r.data),

  toggleUserStatus: (id: string) =>
    api.patch<ApiResponse<{ isActive: boolean }>>(`/auth/users/${id}/toggle`).then((r) => r.data),

  deleteUser: (id: string) =>
    api.delete<ApiResponse>(`/auth/users/${id}`).then((r) => r.data),

  updateProviderApproval: (id: string, approvalStatus: "approved" | "rejected" | "pending") =>
    api.patch<ApiResponse<{ approvalStatus: string }>>(`/auth/users/${id}/approval`, { approvalStatus }).then((r) => r.data),
};
