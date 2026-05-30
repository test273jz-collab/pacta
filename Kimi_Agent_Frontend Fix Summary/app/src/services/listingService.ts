import api from "./api";
import type {
  ApiResponse,
  Hotel,
  Resort,
  Rental,
  Guide,
  UnifiedListing,
  PaginationMeta,
} from "@/types";

export const hotelService = {
  getAll: (params?: any) =>
    api
      .get<
        ApiResponse<Hotel[]> & { pagination: PaginationMeta }
      >("/hotels", { params })
      .then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Hotel>>(`/hotels/${id}`).then((r) => r.data),
  getMy: () =>
    api
      .get<
        ApiResponse<Hotel[]> & { pagination: PaginationMeta }
      >("/hotels/my/listings")
      .then((r) => r.data),
  create: (data: any) =>
    api.post<ApiResponse<Hotel>>("/hotels", data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<Hotel>>(`/hotels/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/hotels/${id}`).then((r) => r.data),
  toggle: (id: string) =>
    api
      .patch<ApiResponse<{ isActive: boolean }>>(`/hotels/${id}/toggle`)
      .then((r) => r.data),
};

export const resortService = {
  getAll: (params?: any) =>
    api
      .get<
        ApiResponse<Resort[]> & { pagination: PaginationMeta }
      >("/resorts", { params })
      .then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Resort>>(`/resorts/${id}`).then((r) => r.data),
  getMy: () =>
    api
      .get<
        ApiResponse<Resort[]> & { pagination: PaginationMeta }
      >("/resorts/my/listings")
      .then((r) => r.data),
  create: (data: any) =>
    api.post<ApiResponse<Resort>>("/resorts", data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<Resort>>(`/resorts/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/resorts/${id}`).then((r) => r.data),
  toggle: (id: string) =>
    api
      .patch<ApiResponse<{ isActive: boolean }>>(`/resorts/${id}/toggle`)
      .then((r) => r.data),
};

export const rentalService = {
  getAll: (params?: any) =>
    api
      .get<
        ApiResponse<Rental[]> & { pagination: PaginationMeta }
      >("/rentals", { params })
      .then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Rental>>(`/rentals/${id}`).then((r) => r.data),
  getMy: () =>
    api
      .get<
        ApiResponse<Rental[]> & { pagination: PaginationMeta }
      >("/rentals/my/listings")
      .then((r) => r.data),
  create: (data: any) =>
    api.post<ApiResponse<Rental>>("/rentals", data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<Rental>>(`/rentals/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/rentals/${id}`).then((r) => r.data),
  toggle: (id: string) =>
    api
      .patch<ApiResponse<{ isActive: boolean }>>(`/rentals/${id}/toggle`)
      .then((r) => r.data),
};

export const guideService = {
  getAll: (params?: any) =>
    api
      .get<
        ApiResponse<Guide[]> & { pagination: PaginationMeta }
      >("/guides", { params })
      .then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<Guide>>(`/guides/${id}`).then((r) => r.data),
  getMy: () =>
    api.get<ApiResponse<Guide>>("/guides/my/profile").then((r) => r.data),
  create: (data: any) =>
    api.post<ApiResponse<Guide>>("/guides", data).then((r) => r.data),
  update: (id: string, data: any) =>
    api.put<ApiResponse<Guide>>(`/guides/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete<ApiResponse>(`/guides/${id}`).then((r) => r.data),
  toggle: (id: string) =>
    api
      .patch<ApiResponse<{ isActive: boolean }>>(`/guides/${id}/toggle`)
      .then((r) => r.data),
};

export const providerService = {
  getListingByCategory: (
    category: string,
    params?: { page?: number; limit?: number },
  ) =>
    api
      .get<
        ApiResponse<UnifiedListing[]> & { pagination: PaginationMeta }
      >(`/providers/category/${category}`, { params })
      .then((r) => r.data),

  getListings: (params?: {
    type?: string;
    category?: string;
    wilaya?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    api
      .get<
        ApiResponse<UnifiedListing[]> & { pagination: PaginationMeta }
      >("/providers", { params })
      .then((r) => r.data),
  getById: (id: string) =>
    api
      .get<ApiResponse<UnifiedListing>>(`/providers/${id}`)
      .then((r) => r.data),
};

export const categoryService = {
  getAll: () => api.get<ApiResponse<any[]>>("/categories").then((r) => r.data),
};

export const adService = {
  getAll: () => api.get<ApiResponse<any[]>>("/ads").then((r) => r.data),
};
