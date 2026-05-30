import api from "./api";
import type { ApiResponse, Reservation, PaginationMeta } from "@/types";

export const reservationService = {
  create: (data: {
    listingId: string;
    listingModel: string;
    startDate: string;
    endDate: string;
    guestCount: number;
    specialRequests?: string;
  }) => api.post<ApiResponse<Reservation>>("/reservations", data).then((r) => r.data),

  getMy: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Reservation[]> & { pagination: PaginationMeta }>("/reservations", { params }).then((r) => r.data),

  getProvider: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Reservation[]> & { pagination: PaginationMeta }>("/reservations/provider", { params }).then((r) => r.data),

  getAll: (params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) =>
    api.get<ApiResponse<Reservation[]> & { pagination: PaginationMeta }>("/reservations/admin/all", { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Reservation>>(`/reservations/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Reservation>>(`/reservations/${id}/status`, { status }).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/reservations/${id}`).then((r) => r.data),
};
