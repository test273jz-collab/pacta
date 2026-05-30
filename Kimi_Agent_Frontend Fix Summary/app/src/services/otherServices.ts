import api from "./api";
import type { ApiResponse, Review, ReviewSummary, WishlistItem, Notification, Contact, AnalyticsOverview, PaginationMeta, ProfileResponse, UpdateProfilePayload, ChangePasswordPayload } from "@/types";

export const reviewService = {
  create: (data: { reservationId: string; rating: number; comment: string }) =>
    api.post<ApiResponse<Review>>("/reviews", data).then((r) => r.data),
  getByListing: (listingId: string, params?: { page?: number; limit?: number; minRating?: number; maxRating?: number }) =>
    api.get<ApiResponse<Review[]> & { pagination: PaginationMeta }>(`/reviews/listing/${listingId}/reviews`, { params }).then((r) => r.data),
  getSummary: (listingId: string) =>
    api.get<ApiResponse<ReviewSummary>>(`/reviews/listing/${listingId}/summary`).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/reviews/${id}`).then((r) => r.data),
};

export const wishlistService = {
  add: (data: { listingId: string; listingModel: string; notes?: string }) =>
    api.post<ApiResponse<WishlistItem>>("/wishlist", data).then((r) => r.data),
  getMy: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<WishlistItem[]> & { pagination: PaginationMeta }>("/wishlist", { params }).then((r) => r.data),
  check: (listingId: string) =>
    api.get<ApiResponse<{ inWishlist: boolean; item: WishlistItem | null }>>(`/wishlist/check/${listingId}`).then((r) => r.data),
  remove: (id: string) =>
    api.delete<ApiResponse>(`/wishlist/${id}`).then((r) => r.data),
};

export const notificationService = {
  getMy: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<ApiResponse<Notification[]> & { pagination: PaginationMeta; unreadCount: number }>("/notifications", { params }).then((r) => r.data),
  markRead: (id: string) =>
    api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () =>
    api.patch<ApiResponse>("/notifications/read-all").then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/notifications/${id}`).then((r) => r.data),
};

export const contactService = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post<ApiResponse<Contact>>("/contact", data).then((r) => r.data),
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get<ApiResponse<Contact[]> & { pagination: PaginationMeta }>("/contact", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Contact>>(`/contact/${id}`).then((r) => r.data),
  reply: (id: string, replyMessage: string) =>
    api.post<ApiResponse<Contact>>(`/contact/${id}/reply`, { replyMessage }).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/contact/${id}`).then((r) => r.data),
};

export const profileService = {
  get: () => api.get<ApiResponse<ProfileResponse>>("/profile").then((r) => r.data),
  update: (payload: UpdateProfilePayload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    return api.put<ApiResponse<ProfileResponse>>("/profile/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
  changePassword: (payload: ChangePasswordPayload) =>
    api.put<ApiResponse>("/profile/change-password", payload).then((r) => r.data),
};

export const analyticsService = {
  getOverview: () =>
    api.get<ApiResponse<AnalyticsOverview>>("/analytics/overview").then((r) => r.data),
  getReservationStats: (days?: number) =>
    api.get<ApiResponse<any>>("/analytics/reservations", { params: { days } }).then((r) => r.data),
  getRevenue: (days?: number) =>
    api.get<ApiResponse<any>>("/analytics/revenue", { params: { days } }).then((r) => r.data),
  getRevenueStats: (days?: number) =>
    api.get<ApiResponse<any>>("/analytics/revenue", { params: { days } }).then((r) => r.data),
  getTopPerformers: (type?: string, limit?: number) =>
    api.get<ApiResponse<any>>("/analytics/top-performers", { params: { type, limit } }).then((r) => r.data),
  getUserGrowth: (days?: number) =>
    api.get<ApiResponse<any>>("/analytics/user-growth", { params: { days } }).then((r) => r.data),
  getReviewStats: () =>
    api.get<ApiResponse<any>>("/analytics/review-stats").then((r) => r.data),
};

export const reviewExtService = {
  voteHelpful: (id: string) =>
    api.post<ApiResponse<any>>(`/reviews/${id}/vote`).then((r) => r.data),
  report: (id: string, data: { reason: string; details?: string }) =>
    api.post<ApiResponse<any>>(`/reviews/${id}/report`, data).then((r) => r.data),
  respond: (id: string, text: string) =>
    api.post<ApiResponse<any>>(`/reviews/${id}/respond`, { text }).then((r) => r.data),
};
