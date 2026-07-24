"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function q<T>(url: string): Promise<T> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });
}

function m<T>(url: string, method: string, body?: unknown): Promise<T> {
  return fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json();
  });
}

// ─── Admin Analytics ──────────────────────────────────────────────
export interface AdminAnalytics {
  stats: {
    appointments: { total: number; month: number; change: number };
    customers: { total: number; month: number; change: number };
    revenue: { month: number; change: number };
    services: number;
    stylists: number;
    statusCounts: Record<string, number>;
  };
  recentAppointments: {
    id: string; reference: string; customer: string | null;
    service: string; stylist: string | null; time: string; status: string; date: string;
  }[];
  popularServices: { name: string; bookings: number }[];
}

export function useAdminAnalytics(pollInterval = 30_000) {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin-analytics"],
    queryFn: () => q("/api/admin/analytics"),
    refetchInterval: pollInterval,
  });
}

// ─── Admin Orders ─────────────────────────────────────────────────
export interface AdminOrderItem {
  id: string; name: string; price: number; quantity: number; image: string | null;
}
export interface AdminOrderPayment {
  id: string; amount: number; status: string; method: string; reference: string;
}
export interface AdminOrder {
  id: string; orderNumber: string; status: string; subtotal: number;
  shippingCost: number; discount: number; total: number;
  shippingAddress: string | null; notes: string | null; trackingNumber: string | null;
  createdAt: string; items: AdminOrderItem[];
  customerProfile: { user: { id: string; name: string | null; email: string | null; image: string | null } };
  payments: AdminOrderPayment[];
}

export function useAdminOrders(params?: { status?: string; search?: string }, pollInterval = 60_000) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return useQuery<{ orders: AdminOrder[] }>({
    queryKey: ["admin-orders", params],
    queryFn: () => q(`/api/admin/orders${qs ? `?${qs}` : ""}`),
    refetchInterval: pollInterval,
  });
}

export function useUpdateAdminOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status: string }) =>
      m(`/api/admin/orders/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  });
}

// ─── Admin Appointments ───────────────────────────────────────────
export interface AdminAppointment {
  id: string; reference: string; date: string; startTime: string; endTime: string;
  status: string; notes: string | null; totalAmount: number; depositPaid: number;
  cancelledAt: string | null; cancelReason: string | null; isRescheduled: boolean;
  service: { id: string; name: string; duration: number; price: number };
  stylist: { id: string; user: { id: string; name: string | null; image: string | null } } | null;
  customerProfile: { user: { id: string; name: string | null; email: string | null; phone: string | null; image: string | null } };
  payments?: { id: string; amount: number; status: string; createdAt: string }[];
}

export function useAdminAppointments(params?: { status?: string; search?: string; date?: string }, pollInterval = 60_000) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.date) searchParams.set("date", params.date);
  const qs = searchParams.toString();
  return useQuery<{ appointments: AdminAppointment[] }>({
    queryKey: ["admin-appointments", params],
    queryFn: () => q(`/api/admin/appointments${qs ? `?${qs}` : ""}`),
    refetchInterval: pollInterval,
  });
}

export function useUpdateAdminAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status: string; cancelReason?: string }) =>
      m(`/api/admin/appointments/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-appointments"] }),
  });
}

// ─── Admin Reviews ────────────────────────────────────────────────
export interface AdminReview {
  id: string; rating: number; title: string | null; comment: string | null;
  isApproved: boolean; isFeatured: boolean; createdAt: string;
  customer: string | null; customerImage: string | null;
  productName: string | null; serviceName: string | null;
}

export function useAdminReviews(params?: { isApproved?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.isApproved) searchParams.set("isApproved", params.isApproved);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return useQuery<{ reviews: AdminReview[] }>({
    queryKey: ["admin-reviews", params],
    queryFn: () => q(`/api/admin/reviews${qs ? `?${qs}` : ""}`),
  });
}

export function useUpdateAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; isApproved?: boolean; isFeatured?: boolean }) =>
      m("/api/admin/reviews", "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

export function useDeleteAdminReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/admin/reviews?id=${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });
}

// ─── Admin Blog ───────────────────────────────────────────────────
export interface BlogPost {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  coverImage: string | null; category: string; tags: string[]; isPublished: boolean;
  isFeatured: boolean; viewCount: number; publishedAt: string | null;
  createdAt: string; author: { id: string; name: string | null };
}

export function useAdminBlog(params?: { search?: string }) {
  const searchParams = new URLSearchParams({ limit: "100" });
  if (params?.search) searchParams.set("search", params.search);
  return useQuery<{ posts: BlogPost[] }>({
    queryKey: ["admin-blog", params],
    queryFn: () => q(`/api/blog?${searchParams}`),
  });
}

export function useUpsertBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, id, ...body }: { method: string; id?: string; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; category: string; tags: string[]; isPublished: boolean; isFeatured: boolean }) =>
      m(id ? `/api/blog?id=${id}` : "/api/blog", method, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/blog?id=${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-blog"] }),
  });
}

// ─── Admin Categories ─────────────────────────────────────────────
export interface AdminCategory {
  id: string; name: string; slug: string; description: string | null;
  image: string | null; type: string; sortOrder: number; isActive: boolean;
  createdAt: string; _count?: { services: number; products: number };
}

export function useAdminCategories(type?: string) {
  return useQuery<{ categories: AdminCategory[] }>({
    queryKey: ["admin-categories", type],
    queryFn: () => q(`/api/categories${type && type !== "all" ? `?type=${type}` : ""}`),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => m("/api/categories", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) =>
      m(`/api/categories/${id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/categories/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-categories"] }),
  });
}

// ─── Admin Services ───────────────────────────────────────────────
export interface AdminService {
  id: string; name: string; slug: string; description: string | null;
  duration: number; price: number; depositAmount: number | null;
  image: string | null; categoryId: string; isActive: boolean;
  isPopular: boolean; sortOrder: number;
  category: { id: string; name: string; slug: string };
  reviewCount: number; appointmentCount: number;
}

export function useAdminServices(params?: { isActive?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.isActive) searchParams.set("isActive", params.isActive);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return useQuery<{ services: AdminService[] }>({
    queryKey: ["admin-services", params],
    queryFn: () => q(`/api/services${qs ? `?${qs}` : ""}`),
  });
}

export function useUpsertService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, id, ...body }: { method: string; id?: string; [k: string]: unknown }) =>
      m(id ? `/api/services/${id}` : "/api/services", method, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/services/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-services"] }),
  });
}

// ─── Admin Products ───────────────────────────────────────────────
export interface AdminProduct {
  id: string; name: string; slug: string; description: string | null;
  shortDesc: string | null; price: number; comparePrice: number | null;
  sku: string | null; image: string | null; images: string[];
  categoryId: string; stock: number; lowStock: number;
  isActive: boolean; isFeatured: boolean;
  hairTexture: string | null; hairLength: string | null; hairColor: string | null;
  category: { id: string; name: string; slug: string };
  reviewCount: number; orderCount: number; wishlistCount: number; variantCount: number;
}

export function useAdminProducts(params?: { isActive?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.isActive) searchParams.set("isActive", params.isActive);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return useQuery<{ products: AdminProduct[] }>({
    queryKey: ["admin-products", params],
    queryFn: () => q(`/api/products${qs ? `?${qs}` : ""}`),
  });
}

export function useUpsertProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, id, ...body }: { method: string; id?: string; [k: string]: unknown }) =>
      m(id ? `/api/products/${id}` : "/api/products", method, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/products/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });
}

// ─── Admin Stylists ───────────────────────────────────────────────
export interface AdminStylist {
  id: string; userId: string; bio: string | null; specialties: string[];
  experience: number | null; isActive: boolean;
  user: { id: string; name: string | null; email: string | null; image: string | null; phone: string | null };
  services: { id: string; service: { id: string; name: string; slug: string; price: number; duration: number } }[];
  appointmentCount: number;
}

export function useAdminStylists(params?: { isActive?: string; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.isActive) searchParams.set("isActive", params.isActive);
  if (params?.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return useQuery<{ stylists: AdminStylist[] }>({
    queryKey: ["admin-stylists", params],
    queryFn: () => q(`/api/stylists${qs ? `?${qs}` : ""}`),
  });
}

export function useUpsertStylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, id, ...body }: { method: string; id?: string; [k: string]: unknown }) =>
      m(id ? `/api/stylists/${id}` : "/api/stylists", method, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stylists"] }),
  });
}

export function useDeleteStylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/stylists/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-stylists"] }),
  });
}

// ─── Admin Schedules ──────────────────────────────────────────────
export interface ScheduleAvailability {
  id?: string; dayOfWeek: number; startTime: string; endTime: string; isBreak: boolean;
}
export interface BlockedTime {
  id: string; date: string; startTime: string | null; endTime: string | null; reason: string | null;
}

export function useScheduleStylists() {
  return useQuery<{ stylists: { id: string; name: string }[] }>({
    queryKey: ["schedule-stylists"],
    queryFn: () => q("/api/admin/schedules"),
  });
}

export function useScheduleData(stylistId: string) {
  return useQuery<{ availability: ScheduleAvailability[]; blockedTimes: BlockedTime[] }>({
    queryKey: ["schedule-data", stylistId],
    queryFn: () => q(`/api/admin/schedules?stylistId=${stylistId}`),
    enabled: !!stylistId,
  });
}

export function useSaveSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { stylistId: string; availability?: ScheduleAvailability[]; blockedTime?: { date: string; startTime?: string; endTime?: string; reason?: string } }) =>
      m("/api/admin/schedules", "POST", body),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["schedule-data", vars.stylistId] }),
  });
}

export function useDeleteBlockedTime(stylistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockedTimeId: string) =>
      m(`/api/admin/schedules?id=${blockedTimeId}&stylistId=${stylistId}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule-data", stylistId] }),
  });
}

// ─── Admin Customers ──────────────────────────────────────────────
export interface AdminCustomer {
  id: string; name: string | null; email: string | null; phone: string | null;
  orders: number; spent: number; appointments: number; joined: string;
}

export function useAdminCustomers(search?: string) {
  const searchParams = new URLSearchParams();
  if (search) searchParams.set("search", search);
  const qs = searchParams.toString();
  return useQuery<{ customers: AdminCustomer[] }>({
    queryKey: ["admin-customers", search],
    queryFn: () => q(`/api/admin/customers${qs ? `?${qs}` : ""}`),
  });
}

// ─── Admin Coupons ────────────────────────────────────────────────
export interface AdminCoupon {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; value: number;
  minOrderAmount: number | null; maxDiscountAmount: number | null;
  usageLimit: number | null; usedCount: number; perUserLimit: number | null;
  expiresAt: string | null; isActive: boolean;
  appliesTo: "ALL" | "PRODUCTS" | "SERVICES";
}

export function useAdminCoupons() {
  return useQuery<{ coupons: AdminCoupon[] }>({
    queryKey: ["admin-coupons"],
    queryFn: () => q("/api/coupons"),
  });
}

export function useUpsertCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ method, id, ...body }: { method: string; id?: string; [k: string]: unknown }) =>
      m(id ? `/api/coupons/${id}` : "/api/coupons", method, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/coupons/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  });
}

// ─── Notifications ────────────────────────────────────────────────
export interface Notification {
  id: string; title: string; message: string; type: string;
  isRead: boolean; actionUrl: string | null; createdAt: string;
}

export function useUnreadCount(pollInterval = 15_000) {
  return useQuery<{ count: number }>({
    queryKey: ["unread-count"],
    queryFn: () => q("/api/notifications/unread-count"),
    refetchInterval: pollInterval,
  });
}

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; total: number }>({
    queryKey: ["notifications"],
    queryFn: () => q("/api/notifications"),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => m(`/api/notifications/${id}`, "PATCH", { isRead: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => m("/api/notifications/read-all", "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
}

// ─── Dashboard Bookings ───────────────────────────────────────────
export interface DashboardAppointment {
  id: string; reference: string; date: string; startTime: string; endTime: string;
  status: string; totalAmount: number; depositPaid: number;
  isFullyPaid: boolean; remaining: number; hasPending: boolean;
  service: { name: string; duration: number };
  stylist: { user: { name: string | null } } | null;
  payments: { id: string; amount: number; status: string; method: string }[];
}

export function useDashboardBookings(pollInterval = 30_000) {
  return useQuery<{ appointments: DashboardAppointment[] }>({
    queryKey: ["dashboard-bookings"],
    queryFn: () => q("/api/bookings"),
    refetchInterval: pollInterval,
  });
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: (paymentId: string) =>
      m("/api/payments/verify", "POST", { paymentId }),
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (body: { appointmentId?: string; orderId?: string }) =>
      m("/api/payments/initiate", "POST", body),
  });
}

// ─── Dashboard Orders ─────────────────────────────────────────────
export interface DashboardOrderItem {
  id: string; name: string; price: number; quantity: number; image: string | null; slug: string;
}
export interface DashboardOrder {
  id: string; orderNumber: string; status: string; total: number;
  createdAt: string; items: DashboardOrderItem[];
}

export function useDashboardOrders(pollInterval = 60_000) {
  return useQuery<{ orders: DashboardOrder[] }>({
    queryKey: ["dashboard-orders"],
    queryFn: () => q("/api/orders"),
    refetchInterval: pollInterval,
  });
}

// ─── Dashboard Hair Profile ───────────────────────────────────────
export interface HairProfile {
  hairType: string; hairLength: string; hairDensity: string;
  scalpCondition: string; allergies: string; notes: string;
}

export function useHairProfile() {
  return useQuery<{ profile: HairProfile | null }>({
    queryKey: ["hair-profile"],
    queryFn: () => q("/api/hair-profile"),
  });
}

export function useSaveHairProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HairProfile) => m("/api/hair-profile", "POST", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hair-profile"] }),
  });
}

// ─── Public: Services ─────────────────────────────────────────────
export interface PublicService {
  id: string; name: string; slug: string; description?: string | null;
  price: number; duration: number; depositAmount?: number;
  isPopular: boolean;
  category: { id: string; name: string; slug: string; type: string };
}

export function useServices(params?: { isActive?: string; isPopular?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.isActive) searchParams.set("isActive", params.isActive);
  if (params?.isPopular) searchParams.set("isPopular", params.isPopular);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return useQuery<{ services: PublicService[] }>({
    queryKey: ["services", params],
    queryFn: () => q(`/api/services${qs ? `?${qs}` : ""}`),
  });
}

// ─── Public: Products ─────────────────────────────────────────────
export interface PublicProduct {
  id: string; name: string; slug: string; price: number;
  comparePrice?: number | null; images: string[];
  stock: number; reviewCount: number; rating?: number;
  isFeatured: boolean; isActive: boolean;
  category: { id: string; name: string; slug: string };
}

export function useProducts(params?: { isActive?: string; isFeatured?: string; limit?: number; category?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.isActive) searchParams.set("isActive", params.isActive);
  if (params?.isFeatured) searchParams.set("isFeatured", params.isFeatured);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.category) searchParams.set("category", params.category);
  const qs = searchParams.toString();
  return useQuery<{ products: PublicProduct[] }>({
    queryKey: ["products", params],
    queryFn: () => q(`/api/products${qs ? `?${qs}` : ""}`),
  });
}

// ─── Public: Shop Categories ──────────────────────────────────────
export interface ShopCategory {
  id: string; name: string; slug: string; image?: string | null;
  _count?: { products: number };
}

export function useShopCategories() {
  return useQuery<{ categories: ShopCategory[] }>({
    queryKey: ["shop-categories"],
    queryFn: () => q("/api/categories?type=product&includeCount=true"),
  });
}

// ─── Public: Stylists ─────────────────────────────────────────────
export interface PublicStylist {
  id: string; bio: string | null; specialties: string[];
  experience: number; isActive: boolean;
  user: { id: string; name: string | null; email: string | null; image: string | null };
  services: { service: { id: string; name: string; slug: string; price: number; duration: number } }[];
  appointmentCount: number;
}

export function usePublicStylists() {
  return useQuery<{ stylists: PublicStylist[] }>({
    queryKey: ["public-stylists"],
    queryFn: () => q("/api/stylists?isActive=true"),
  });
}

// ─── Public: Reviews ──────────────────────────────────────────────
export interface PublicReview {
  id: string; name: string; rating: number; comment: string;
  service?: string | null; date: string; avatar?: string | null;
}

export function useFeaturedReviews(limit = 10) {
  return useQuery<{ reviews: PublicReview[] }>({
    queryKey: ["featured-reviews"],
    queryFn: () => q(`/api/reviews?isFeatured=true&limit=${limit}`),
  });
}

// ─── Booking Slots ────────────────────────────────────────────────
export function useBookingSlots(params: { stylistId: string; serviceId: string; date: string }) {
  const searchParams = new URLSearchParams({
    stylistId: params.stylistId,
    serviceId: params.serviceId,
    date: params.date,
  });
  return useQuery<{ slots: { time: string; available: boolean; reason: string | null }[]; workingHours: { stylistId: string; start: string; end: string }[] }>({
    queryKey: ["booking-slots", params],
    queryFn: () => q(`/api/bookings/slots?${searchParams}`),
    enabled: !!(params.stylistId && params.serviceId && params.date),
  });
}

// ─── Coupon Validation ────────────────────────────────────────────
export function useValidateCoupon() {
  return useMutation({
    mutationFn: (body: { code: string; orderAmount?: number; serviceId?: string }) =>
      m("/api/coupons/validate", "POST", body),
  });
}

// ─── Upload ───────────────────────────────────────────────────────
export function useUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  });
}

// ─── Cart coupon validation ───────────────────────────────────────
export function useCartCouponValidation() {
  return useMutation({
    mutationFn: (body: { code: string; orderAmount: number }) =>
      m("/api/coupons/validate", "POST", body),
  });
}

// ─── Wishlist ──────────────────────────────────────────────────────
export interface WishlistItem {
  id: string; productId: string; createdAt: string;
  product: {
    id: string; name: string; slug: string; price: number; comparePrice: number | null;
    image: string | null; stock: number;
    reviews: { rating: number }[];
  };
}

export function useWishlist() {
  return useQuery<{ wishlist: WishlistItem[] }>({
    queryKey: ["wishlist"],
    queryFn: () => q("/api/wishlist"),
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      m<{ wishlisted: boolean }>("/api/wishlist", "POST", { productId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
}

// ─── Admin Consultations ──────────────────────────────────────────
export interface AdminConsultation {
  id: string; hairConcerns: string; desiredHairstyle: string | null;
  hairType: string | null; additionalNotes: string | null;
  adminNotes: string | null; recommendedService: string | null;
  recommendedProduct: string | null; priceEstimate: number | null;
  status: string; createdAt: string;
  name: string | null; email: string | null; phone: string | null;
  customerProfile: {
    user: { name: string | null; email: string | null; phone: string | null };
  } | null;
}

export function useConsultations() {
  return useQuery<{ consultations: AdminConsultation[] }>({
    queryKey: ["admin-consultations"],
    queryFn: () => q("/api/consultations"),
  });
}

export function useUpdateConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { id: string; status?: string; adminNotes?: string; recommendedService?: string; recommendedProduct?: string; priceEstimate?: number }) =>
      m(`/api/consultations?id=${body.id}`, "PATCH", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-consultations"] }),
  });
}
