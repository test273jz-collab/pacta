import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, CalendarCheck, Star, TrendingUp, Loader2,
  CheckCircle, XCircle, Clock, ChevronRight,
  DollarSign, Users, MessageSquare, Bell, Hourglass, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://pacta-iw8j.onrender.com/api";
const fetchApi = async (path: string, options?: RequestInit) => {
  const token = localStorage.getItem("pacta_token") || localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...options,
  });
  return res.json();
};

interface Reservation {
  _id: string;
  tourist: { name: string; avatar?: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  guestCount: number;
  createdAt: string;
  listingDetails?: { titleEn?: string; titleAr?: string };
}

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; icon: any; color: string; bg: string }> = {
  pending:   { label: "Pending",   labelAr: "معلق",   icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50"  },
  confirmed: { label: "Confirmed", labelAr: "مؤكد",   icon: CheckCircle,   color: "text-emerald-600", bg: "bg-emerald-50" },
  completed: { label: "Completed", labelAr: "مكتمل",  icon: CheckCircle,   color: "text-teal-600",   bg: "bg-teal-50"   },
  cancelled: { label: "Cancelled", labelAr: "ملغي",   icon: XCircle,       color: "text-rose-500",   bg: "bg-rose-50"   },
};

export default function ProviderDashboard() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const approvalStatus = (user as any)?.approvalStatus || "pending";
  const isPending  = approvalStatus === "pending";
  const isRejected = approvalStatus === "rejected";
  const isApproved = approvalStatus === "approved";

  useEffect(() => {
    if (isApproved) fetchReservations();
    else setLoading(false);
  }, [isApproved]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/reservations/provider?limit=50");
      if (res.success) setReservations(res.data || []);
    } catch {
      toast.error(isRTL ? "فشل تحميل الحجوزات" : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetchApi(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
        toast.success(isRTL ? "تم تحديث الحالة" : "Status updated");
      } else {
        toast.error(res.message || "Error");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    revenue: reservations
      .filter((r) => ["confirmed", "completed"].includes(r.status))
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0),
  };

  const roleLabel: Record<string, { en: string; ar: string }> = {
    hotel_owner:  { en: "Hotel Owner",  ar: "صاحب فندق" },
    resort_owner: { en: "Resort Owner", ar: "صاحب منتجع" },
    rental_owner: { en: "Rental Owner", ar: "صاحب عقار" },
    guide:        { en: "Tour Guide",   ar: "مرشد سياحي" },
  };
  const roleName = roleLabel[user?.role || ""] || { en: "Provider", ar: "مزود" };

  const filtered = filterStatus === "all"
    ? reservations
    : reservations.filter((r) => r.status === filterStatus);

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-pacta-navy to-pacta-teal text-white rounded-2xl shadow-lg">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pacta-navy">
              {isRTL ? `لوحة تحكم ${roleName.ar}` : `${roleName.en} Dashboard`}
            </h1>
            <p className="text-gray-400 text-sm">
              {isRTL ? `مرحباً، ${user?.name}` : `Welcome back, ${user?.name}`}
            </p>
          </div>
        </div>
        {isApproved && (
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-3 bg-white border border-pacta-sand rounded-2xl hover:border-pacta-navy/30 transition-all"
          >
            <Bell size={18} className="text-pacta-navy" />
            {stats.pending > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats.pending}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ===== PENDING APPROVAL BANNER ===== */}
      {isPending && (
        <div className="mb-8 rounded-3xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Hourglass size={32} className="text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-amber-800 mb-2">
            {isRTL ? "حسابك قيد المراجعة" : "Your Account is Under Review"}
          </h2>
          <p className="text-amber-700 text-sm max-w-md mx-auto leading-relaxed">
            {isRTL
              ? "شكراً لتسجيلك! يقوم فريقنا بمراجعة طلبك. ستتمكن من إدارة حجوزاتك وخدماتك بمجرد موافقة المسؤول. قد يستغرق هذا حتى 24 ساعة."
              : "Thank you for registering! Our team is reviewing your application. You'll be able to manage bookings and your service listing once an admin approves your account. This may take up to 24 hours."}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 border border-amber-200 rounded-2xl text-amber-700 text-sm font-semibold">
            <Clock size={14} />
            {isRTL ? "في انتظار الموافقة..." : "Awaiting approval..."}
          </div>
        </div>
      )}

      {/* ===== REJECTED BANNER ===== */}
      {isRejected && (
        <div className="mb-8 rounded-3xl border-2 border-red-200 bg-red-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">
            {isRTL ? "تم رفض طلبك" : "Your Application Was Rejected"}
          </h2>
          <p className="text-red-700 text-sm max-w-md mx-auto leading-relaxed">
            {isRTL
              ? "للأسف تم رفض طلبك من قبل المسؤول. يرجى التواصل مع فريق الدعم لمزيد من المعلومات."
              : "Unfortunately your application was rejected by the admin. Please contact our support team for more information."}
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-2xl text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            {isRTL ? "تواصل مع الدعم" : "Contact Support"}
          </button>
        </div>
      )}

      {/* ===== APPROVED CONTENT ===== */}
      {isApproved && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: isRTL ? "إجمالي الحجوزات" : "Total Bookings", val: stats.total,                          icon: CalendarCheck, gradient: "from-pacta-navy to-pacta-teal" },
              { label: isRTL ? "حجوزات معلقة"   : "Pending",         val: stats.pending,                        icon: Clock,         gradient: "from-amber-500 to-orange-400" },
              { label: isRTL ? "حجوزات مؤكدة"   : "Confirmed",       val: stats.confirmed,                      icon: CheckCircle,   gradient: "from-emerald-500 to-teal-400" },
              { label: isRTL ? "الإيرادات"       : "Revenue",         val: `${stats.revenue.toLocaleString()} DA`, icon: DollarSign,    gradient: "from-pacta-gold to-amber-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl border border-pacta-sand p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-md mb-4`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-pacta-navy mt-1">{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Quick Nav */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: isRTL ? "ملفي الشخصي" : "My Profile", icon: Users,        path: "/profile" },
              { label: isRTL ? "تقييماتي"    : "My Reviews", icon: Star,          path: "/reviews" },
              { label: isRTL ? "إحصائياتي"   : "My Stats",   icon: TrendingUp,    path: "/dashboard" },
              { label: isRTL ? "الرسائل"      : "Messages",   icon: MessageSquare, path: "/contact" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-pacta-sand hover:border-pacta-navy/30 hover:shadow-md transition-all group"
              >
                <div className="p-2.5 bg-pacta-navy/5 rounded-xl group-hover:bg-pacta-navy/10 transition-colors">
                  <item.icon size={16} className="text-pacta-navy" />
                </div>
                <span className="text-sm font-bold text-gray-600">{item.label}</span>
                <ChevronRight size={14} className={`ml-auto text-gray-300 ${isRTL ? "rotate-180" : ""}`} />
              </button>
            ))}
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-3xl border border-pacta-sand overflow-hidden">
            <div className="px-6 py-5 border-b border-pacta-sand flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-pacta-navy">{isRTL ? "إدارة الحجوزات" : "Manage Bookings"}</h2>
              {/* Status filter */}
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterStatus === s
                        ? "bg-pacta-navy text-white"
                        : "bg-pacta-sand/40 text-gray-500 hover:bg-pacta-sand"
                    }`}
                  >
                    {s === "all" ? (isRTL ? "الكل" : "All") :
                     isRTL ? STATUS_CONFIG[s]?.labelAr : STATUS_CONFIG[s]?.label}
                    {s !== "all" && (
                      <span className="ml-1.5 opacity-70">
                        {reservations.filter((r) => r.status === s).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-pacta-navy" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">{isRTL ? "لا توجد حجوزات" : "No bookings found"}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pacta-sand/50 bg-pacta-sand/10">
                      {[
                        isRTL ? "العميل" : "Guest",
                        isRTL ? "الخدمة" : "Service",
                        isRTL ? "تواريخ" : "Dates",
                        isRTL ? "الضيوف" : "Guests",
                        isRTL ? "المبلغ" : "Amount",
                        isRTL ? "الحالة" : "Status",
                        isRTL ? "إجراءات" : "Actions",
                      ].map((h, i) => (
                        <th key={i} className="px-5 py-3 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pacta-sand/30">
                    {filtered.map((res) => {
                      const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
                      const title = isRTL
                        ? res.listingDetails?.titleAr || res.listingDetails?.titleEn
                        : res.listingDetails?.titleEn || res.listingDetails?.titleAr;
                      return (
                        <tr key={res._id} className="hover:bg-pacta-cream/40 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pacta-navy to-pacta-teal text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {res.tourist?.name?.charAt(0) || "?"}
                              </div>
                              <span className="text-sm font-bold text-pacta-navy whitespace-nowrap">{res.tourist?.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500 max-w-[140px] truncate">{title || "—"}</td>
                          <td className="px-5 py-4">
                            <p className="text-xs font-bold text-gray-600 whitespace-nowrap">
                              {new Date(res.startDate).toLocaleDateString(isRTL ? "ar-DZ" : "en-US", { month: "short", day: "numeric" })}
                            </p>
                            <p className="text-[10px] text-gray-400 whitespace-nowrap">
                              → {new Date(res.endDate).toLocaleDateString(isRTL ? "ar-DZ" : "en-US", { month: "short", day: "numeric" })}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-600">
                              <Users size={12} className="text-gray-400" />
                              {res.guestCount || 1}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-bold text-pacta-navy whitespace-nowrap">{res.totalPrice?.toLocaleString()} DA</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                              <cfg.icon size={11} />
                              {isRTL ? cfg.labelAr : cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              {res.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => updateStatus(res._id, "confirmed")}
                                    disabled={updatingId === res._id}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {updatingId === res._id ? <Loader2 size={11} className="animate-spin" /> : (isRTL ? "قبول" : "Accept")}
                                  </button>
                                  <button
                                    onClick={() => updateStatus(res._id, "cancelled")}
                                    disabled={updatingId === res._id}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {isRTL ? "رفض" : "Decline"}
                                  </button>
                                </>
                              )}
                              {res.status === "confirmed" && (
                                <button
                                  onClick={() => updateStatus(res._id, "completed")}
                                  disabled={updatingId === res._id}
                                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                  {isRTL ? "إكمال" : "Mark Complete"}
                                </button>
                              )}
                              {["completed", "cancelled"].includes(res.status) && (
                                <span className="text-xs text-gray-300 font-medium">{isRTL ? "منتهي" : "Done"}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
